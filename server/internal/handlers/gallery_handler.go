package handlers

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
)

// ListGalleryPhotos retrieves all prewedding photos for a couple
func (h *Handler) ListGalleryPhotos(c *gin.Context) {
	slug := c.Param("slug")

	var photos []models.GalleryPhoto
	if err := h.db.Where("couple_slug = ?", slug).Order("gallery_photos.order asc, gallery_photos.created_at asc").Find(&photos).Error; err != nil {
		response.InternalError(c, "Gagal memuat galeri foto")
		return
	}

	response.Success(c, photos)
}

// AddGalleryPhoto adds a new photo to the album
func (h *Handler) AddGalleryPhoto(c *gin.Context) {
	slug := c.Param("slug")

	var req models.AddGalleryPhotoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var count int64
	h.db.Model(&models.GalleryPhoto{}).Where("couple_slug = ?", slug).Count(&count)
	if count >= 15 {
		response.BadRequest(c, "Maksimal 15 foto yang dapat diunggah ke galeri")
		return
	}

	photo := models.GalleryPhoto{
		CoupleSlug: slug,
		URL:        req.URL,
		Caption:    req.Caption,
		Order:      req.Order,
	}

	if err := h.db.Create(&photo).Error; err != nil {
		response.InternalError(c, "Gagal menambahkan foto")
		return
	}

	response.Created(c, photo)
}

// UpdateGalleryPhoto updates a photo's caption or display order
func (h *Handler) UpdateGalleryPhoto(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var photo models.GalleryPhoto
	if err := h.db.Where("(id = ? OR url = ?) AND couple_slug = ?", id, id, slug).First(&photo).Error; err != nil {
		response.NotFound(c, "Foto tidak ditemukan")
		return
	}

	var req struct {
		Caption *string `json:"caption"`
		Order   *int    `json:"order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	if req.Caption != nil {
		photo.Caption = *req.Caption
	}
	if req.Order != nil {
		photo.Order = *req.Order
	}

	if err := h.db.Save(&photo).Error; err != nil {
		response.InternalError(c, "Gagal memperbarui keterangan foto")
		return
	}

	response.SuccessWithMessage(c, "Keterangan foto berhasil diperbarui", photo)
}

// DeleteGalleryPhoto removes a photo from the album and disk
func (h *Handler) DeleteGalleryPhoto(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var photo models.GalleryPhoto
	if err := h.db.Where("id = ? AND LOWER(couple_slug) = LOWER(?)", id, slug).First(&photo).Error; err != nil {
		response.NotFound(c, "Foto tidak ditemukan")
		return
	}

	// Remove physical file from disk if local upload
	if strings.HasPrefix(photo.URL, "/uploads/") {
		rel := strings.TrimPrefix(photo.URL, "/uploads/")
		filePath := filepath.Join(h.config.UploadPath, rel)
		_ = os.Remove(filePath)
	}

	if err := h.db.Delete(&photo).Error; err != nil {
		response.InternalError(c, "Gagal menghapus foto")
		return
	}

	response.SuccessWithMessage(c, "Foto berhasil dihapus", nil)
}
