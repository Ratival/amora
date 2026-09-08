package handlers

import (
	"time"

	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
)

// ListGuests filters and lists guests for a specific couple
func (h *Handler) ListGuests(c *gin.Context) {
	slug := c.Param("slug")
	category := c.Query("category")
	status := c.Query("status")
	search := c.Query("search")

	query := h.db.Where("couple_slug = ?", slug)

	if category != "" && category != "All" {
		query = query.Where("category = ?", category)
	}

	if status != "" && status != "all" {
		query = query.Where("rsvp_status = ?", status)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("name ILIKE ? OR phone ILIKE ? OR table_number ILIKE ?", searchPattern, searchPattern, searchPattern)
	}

	var guests []models.Guest
	if err := query.Order("created_at desc").Find(&guests).Error; err != nil {
		response.InternalError(c, "Gagal memuat daftar tamu")
		return
	}

	response.Success(c, guests)
}

// CreateGuest adds a new guest to the couple's invitation list
func (h *Handler) CreateGuest(c *gin.Context) {
	slug := c.Param("slug")

	var req models.CreateGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	category := req.Category
	if category == "" {
		category = "Sahabat"
	}

	pax := req.Pax
	if pax <= 0 {
		pax = 1
	}

	guest := models.Guest{
		CoupleSlug:  slug,
		Name:        req.Name,
		Phone:       req.Phone,
		Category:    category,
		Pax:         pax,
		RSVPStatus:  "Pending",
		TableNumber: req.TableNumber,
	}

	if err := h.db.Create(&guest).Error; err != nil {
		response.InternalError(c, "Gagal menambahkan tamu")
		return
	}

	response.Created(c, guest)
}

// UpdateGuest updates guest details, RSVP status, pax, or table
func (h *Handler) UpdateGuest(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var guest models.Guest
	if err := h.db.Where("id = ? AND couple_slug = ?", id, slug).First(&guest).Error; err != nil {
		response.NotFound(c, "Data tamu tidak ditemukan")
		return
	}

	var req models.UpdateGuestRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Pax != nil {
		updates["pax"] = *req.Pax
	}
	if req.RSVPStatus != "" {
		updates["rsvp_status"] = req.RSVPStatus
	}
	if req.Attended != nil {
		updates["attended"] = *req.Attended
		if *req.Attended && guest.CheckInTime == "" {
			updates["check_in_time"] = time.Now().Format("15:04 WIB")
		} else if !*req.Attended {
			updates["check_in_time"] = ""
		}
	}
	if req.CheckInTime != "" {
		updates["check_in_time"] = req.CheckInTime
	}
	if req.TableNumber != "" {
		updates["table_number"] = req.TableNumber
	}
	if req.Message != "" {
		updates["message"] = req.Message
	}

	if err := h.db.Model(&guest).Updates(updates).Error; err != nil {
		response.InternalError(c, "Gagal memperbarui data tamu")
		return
	}

	h.db.First(&guest, "id = ?", id)
	response.Success(c, guest)
}

// DeleteGuest removes a guest from the guest list
func (h *Handler) DeleteGuest(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var guest models.Guest
	if err := h.db.Where("id = ? AND couple_slug = ?", id, slug).First(&guest).Error; err != nil {
		response.NotFound(c, "Data tamu tidak ditemukan")
		return
	}

	if err := h.db.Delete(&guest).Error; err != nil {
		response.InternalError(c, "Gagal menghapus tamu")
		return
	}

	response.SuccessWithMessage(c, "Tamu berhasil dihapus", nil)
}

// ToggleGuestCheckIn instantly toggles venue arrival check-in via QR Code scan
func (h *Handler) ToggleGuestCheckIn(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var guest models.Guest
	if err := h.db.Where("id = ? AND couple_slug = ?", id, slug).First(&guest).Error; err != nil {
		response.NotFound(c, "Data tamu tidak ditemukan")
		return
	}

	newStatus := !guest.Attended
	var checkInTime string
	if newStatus {
		checkInTime = time.Now().Format("15:04 WIB")
	}

	guest.Attended = newStatus
	guest.CheckInTime = checkInTime
	h.db.Save(&guest)

	response.SuccessWithMessage(c, "Status Check-in berhasil diperbarui", guest)
}
