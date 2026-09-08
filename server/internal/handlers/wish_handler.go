package handlers

import (
	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ListWishes lists all greetings and wishes for a couple with replies
func (h *Handler) ListWishes(c *gin.Context) {
	slug := c.Param("slug")

	var wishes []models.Wish
	if err := h.db.Where("LOWER(couple_slug) = LOWER(?)", slug).
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at desc")
		}).
		Order("is_pinned desc, created_at desc").Find(&wishes).Error; err != nil {
		response.InternalError(c, "Gagal memuat ucapan")
		return
	}

	response.Success(c, wishes)
}

// TogglePinWish pins or unpins a wish at the top of the guestbook
func (h *Handler) TogglePinWish(c *gin.Context) {
	id := c.Param("id")

	var wish models.Wish
	if err := h.db.Where("id = ?", id).First(&wish).Error; err != nil {
		response.NotFound(c, "Ucapan tidak ditemukan")
		return
	}

	wish.IsPinned = !wish.IsPinned
	h.db.Save(&wish)

	h.db.Preload("Replies", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).First(&wish, "id = ?", id)
	response.SuccessWithMessage(c, "Status semat berhasil diperbarui", wish)
}

// ReplyWish allows the couple to post a reply to a guest's wish
func (h *Handler) ReplyWish(c *gin.Context) {
	slug := c.Param("slug")
	id := c.Param("id")

	var wish models.Wish
	if err := h.db.Where("id = ?", id).First(&wish).Error; err != nil {
		response.NotFound(c, "Ucapan tidak ditemukan")
		return
	}

	var req models.ReplyWishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var couple models.Couple
	author := "Kedua Mempelai"
	if err := h.db.Where("LOWER(slug) = LOWER(?)", slug).First(&couple).Error; err == nil {
		if couple.GroomName != "" && couple.BrideName != "" {
			author = couple.GroomName + " & " + couple.BrideName
		}
	}

	// Update existing reply or create a new one
	var existingReply models.WishReply
	if err := h.db.Where("wish_id = ?", id).First(&existingReply).Error; err == nil {
		existingReply.Author = author
		existingReply.Message = req.Message
		if err := h.db.Save(&existingReply).Error; err != nil {
			response.InternalError(c, "Gagal memperbarui balasan")
			return
		}
	} else {
		reply := models.WishReply{
			WishID:  id,
			Author:  author,
			Message: req.Message,
		}
		if err := h.db.Create(&reply).Error; err != nil {
			response.InternalError(c, "Gagal mengirimkan balasan")
			return
		}
	}

	h.db.Preload("Replies", func(db *gorm.DB) *gorm.DB {
		return db.Order("created_at desc")
	}).First(&wish, "id = ?", id)
	response.Created(c, wish)
}

// DeleteWish removes a wish from the guestbook
func (h *Handler) DeleteWish(c *gin.Context) {
	id := c.Param("id")

	var wish models.Wish
	if err := h.db.Where("id = ?", id).First(&wish).Error; err != nil {
		response.NotFound(c, "Ucapan tidak ditemukan")
		return
	}

	// Clean up any replies linked to this wish
	h.db.Where("wish_id = ?", id).Delete(&models.WishReply{})

	if err := h.db.Unscoped().Delete(&wish).Error; err != nil {
		response.InternalError(c, "Gagal menghapus ucapan")
		return
	}

	response.SuccessWithMessage(c, "Ucapan berhasil dihapus", nil)
}

