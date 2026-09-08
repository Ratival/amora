package handlers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/Ratival/amora/server/internal/config"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"gorm.io/gorm"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Handler struct {
	db     *gorm.DB
	config *config.Config
	hub    *WebSocketHub
}

func NewHandler(db *gorm.DB, cfg *config.Config) *Handler {
	hub := NewWebSocketHub()
	go hub.Run()
	return &Handler{
		db:     db,
		config: cfg,
		hub:    hub,
	}
}

func (h *Handler) HealthCheck(c *gin.Context) {
	response.Success(c, gin.H{
		"status":  "healthy",
		"service": "Amora SaaS Backend API",
		"version": "1.0.0",
	})
}

func (h *Handler) UploadFile(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "Tidak ada file yang diunggah")
		return
	}

	if file.Size > h.config.MaxFileSize {
		response.BadRequest(c, "Ukuran file melebihi batas maksimum")
		return
	}

	slug := strings.TrimSpace(c.PostForm("slug"))
	if slug == "" {
		slug = strings.TrimSpace(c.Query("slug"))
	}
	if slug == "" {
		if val, exists := c.Get("coupleSlug"); exists {
			if s, ok := val.(string); ok {
				slug = s
			}
		}
	}

	targetDir := h.config.UploadPath
	relativePrefix := "/uploads"
	if slug != "" {
		targetDir = filepath.Join(h.config.UploadPath, slug)
		relativePrefix = "/uploads/" + slug
	}

	// Ensure upload directory exists
	if err := os.MkdirAll(targetDir, 0755); err != nil {
		response.InternalError(c, "Gagal membuat direktori upload")
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	savePath := filepath.Join(targetDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		response.InternalError(c, "Gagal menyimpan file")
		return
	}

	relativePath := relativePrefix + "/" + filename

	response.Created(c, gin.H{
		"filename": filename,
		"url":      relativePath,
		"path":     relativePath,
		"size":     file.Size,
		"slug":     slug,
	})
}

func (h *Handler) ServeFile(c *gin.Context) {
	filename := c.Param("filename")
	filepath := h.config.UploadPath + "/" + filename

	c.File(filepath)
}

func (h *Handler) DeleteFile(c *gin.Context) {
	filename := c.Param("filename")
	filepath := h.config.UploadPath + "/" + filename

	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		response.NotFound(c, "File tidak ditemukan")
		return
	}

	if err := os.Remove(filepath); err != nil {
		response.InternalError(c, "Gagal menghapus file")
		return
	}

	response.SuccessWithMessage(c, "File berhasil dihapus", nil)
}

func (h *Handler) WebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		hub:  h.hub,
		conn: conn,
		send: make(chan []byte, 256),
	}

	h.hub.register <- client

	go client.writePump()
	go client.readPump()
}

func parseInt(s string) int {
	var n int
	for _, c := range s {
		if c < '0' || c > '9' {
			return 0
		}
		n = n*10 + int(c-'0')
	}
	return n
}

// WebSocket Hub
type WebSocketHub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.Mutex
}

func NewWebSocketHub() *WebSocketHub {
	return &WebSocketHub{
		clients:    make(map[*Client]bool),
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *WebSocketHub) Run() {
	go h.runRegister()
	go h.runUnregister()
	go h.runBroadcast()
	<-make(chan struct{})
}

func (h *WebSocketHub) runRegister() {
	for client := range h.register {
		h.mu.Lock()
		h.clients[client] = true
		h.mu.Unlock()
	}
}

func (h *WebSocketHub) runUnregister() {
	for client := range h.unregister {
		h.mu.Lock()
		if _, ok := h.clients[client]; ok {
			delete(h.clients, client)
			close(client.send)
		}
		h.mu.Unlock()
	}
}

func (h *WebSocketHub) runBroadcast() {
	for message := range h.broadcast {
		h.mu.Lock()
		for client := range h.clients {
			select {
			case client.send <- message:
			default:
				close(client.send)
				delete(h.clients, client)
			}
		}
		h.mu.Unlock()
	}
}

type Client struct {
	hub  *WebSocketHub
	conn *websocket.Conn
	send chan []byte
}

func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			break
		}
		c.hub.broadcast <- message
	}
}

func (c *Client) writePump() {
	defer func() {
		c.conn.Close()
	}()

	for message := range c.send {
		if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
			return
		}
	}
	c.conn.WriteMessage(websocket.CloseMessage, []byte{})
}
