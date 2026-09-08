package handlers

import (
	"strings"

	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
)

// GetCoupleDashboardDetails returns complete couple details and dashboard stats
func (h *Handler) GetCoupleDashboardDetails(c *gin.Context) {
	slug := c.Param("slug")

	var couple models.Couple
	if err := h.db.Where("slug = ?", slug).First(&couple).Error; err != nil {
		response.NotFound(c, "Undangan pernikahan tidak ditemukan")
		return
	}

	// Compute dashboard stats
	var totalGuests int64
	var attendingCount int64
	var tentativeCount int64
	var regretCount int64
	var pendingCount int64
	var checkInCount int64
	var totalWishes int64

	h.db.Model(&models.Guest{}).Where("couple_slug = ?", slug).Count(&totalGuests)
	h.db.Model(&models.Guest{}).Where("couple_slug = ? AND rsvp_status = ?", slug, "Attending").Count(&attendingCount)
	h.db.Model(&models.Guest{}).Where("couple_slug = ? AND rsvp_status = ?", slug, "Tentative").Count(&tentativeCount)
	h.db.Model(&models.Guest{}).Where("couple_slug = ? AND rsvp_status = ?", slug, "Regret").Count(&regretCount)
	h.db.Model(&models.Guest{}).Where("couple_slug = ? AND rsvp_status = ?", slug, "Pending").Count(&pendingCount)
	h.db.Model(&models.Guest{}).Where("couple_slug = ? AND attended = ?", slug, true).Count(&checkInCount)
	h.db.Model(&models.Wish{}).Where("couple_slug = ?", slug).Count(&totalWishes)

	couple.GuestCount = int(totalGuests)

	var gallery []models.GalleryPhoto
	h.db.Where("couple_slug = ?", couple.Slug).Order("gallery_photos.order asc, gallery_photos.created_at asc").Find(&gallery)

	response.Success(c, gin.H{
		"couple":  couple,
		"gallery": gallery,
		"stats": gin.H{
			"totalGuests":    totalGuests,
			"attendingCount": attendingCount,
			"tentativeCount": tentativeCount,
			"regretCount":    regretCount,
			"pendingCount":   pendingCount,
			"checkInCount":   checkInCount,
			"totalWishes":    totalWishes,
		},
	})
}

// UpdateCouple updates wedding details, events, quotes, music, and settings
func (h *Handler) UpdateCouple(c *gin.Context) {
	slug := c.Param("slug")

	var couple models.Couple
	if err := h.db.Where("slug = ?", slug).First(&couple).Error; err != nil {
		response.NotFound(c, "Undangan pernikahan tidak ditemukan")
		return
	}

	var rawMap map[string]interface{}
	if err := c.ShouldBindJSON(&rawMap); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	updates := make(map[string]interface{})

	// Field mapping from JSON camelCase to DB snake_case
	fieldMap := map[string]string{
		"title":               "title",
		"status":              "status",
		"groomName":           "groom_name",
		"groomParents":        "groom_parents",
		"groomBio":            "groom_bio",
		"groomInstagram":      "groom_instagram",
		"groomPhoto":          "groom_photo",
		"brideName":           "bride_name",
		"brideParents":        "bride_parents",
		"brideBio":            "bride_bio",
		"brideInstagram":      "bride_instagram",
		"bridePhoto":          "bride_photo",
		"akadDate":            "akad_date",
		"akadTime":            "akad_time",
		"akadVenue":           "akad_venue",
		"akadAddress":         "akad_address",
		"akadMapsUrl":         "akad_maps_url",
		"resepsiDate":         "resepsi_date",
		"resepsiTime":         "resepsi_time",
		"resepsiVenue":        "resepsi_venue",
		"resepsiAddress":      "resepsi_address",
		"resepsiMapsUrl":      "resepsi_maps_url",
		"weddingDate":         "wedding_date",
		"storyQuote":          "story_quote",
		"liveStreamUrl":       "live_stream_url",
		"musicTitle":          "music_title",
		"musicArtist":         "music_artist",
		"musicUrl":            "music_url",
		"themeId":             "theme_id",
		"heroPhotoIds":        "hero_photo_ids",
		"storyPhotoIds":       "story_photo_ids",
		"storyChapters":       "story_chapters",
		"bankAccounts":        "bank_accounts",
		"isPasswordProtected": "is_password_protected",
		"password":            "password",
		"rsvpDeadline":        "rsvp_deadline",
		"qrCheckInEnabled":    "qr_check_in_enabled",
		"guestCount":          "guest_count",
	}

	for jsonKey, dbCol := range fieldMap {
		if val, exists := rawMap[jsonKey]; exists {
			updates[dbCol] = val
		}
	}

	if len(updates) > 0 {
		if err := h.db.Model(&couple).Updates(updates).Error; err != nil {
			response.InternalError(c, "Gagal memperbarui data pernikahan")
			return
		}
	}

	// Synchronize gallery photos & captions if provided in payload
	if rawGallery, exists := rawMap["galleryPhotos"]; exists {
		if galleryList, ok := rawGallery.([]interface{}); ok {
			for idx, item := range galleryList {
				if photoMap, isMap := item.(map[string]interface{}); isMap {
					photoID, _ := photoMap["id"].(string)
					photoURL, _ := photoMap["url"].(string)
					caption, _ := photoMap["caption"].(string)

					if photoURL != "" {
						var existing models.GalleryPhoto
						err := h.db.Where("(id = ? OR url = ?) AND couple_slug = ?", photoID, photoURL, couple.Slug).First(&existing).Error
						if err == nil {
							h.db.Model(&existing).Updates(map[string]interface{}{
								"caption": caption,
								"order":   idx + 1,
							})
						} else {
							newPhoto := models.GalleryPhoto{
								CoupleSlug: couple.Slug,
								URL:        photoURL,
								Caption:    caption,
								Order:      idx + 1,
							}
							if photoID != "" && len(photoID) > 5 && !strings.HasPrefix(photoID, "g-") {
								newPhoto.ID = photoID
							}
							h.db.Create(&newPhoto)
						}
					}
				}
			}
		}
	}

	h.db.First(&couple, "slug = ?", slug)

	var gallery []models.GalleryPhoto
	h.db.Where("couple_slug = ?", couple.Slug).Order("gallery_photos.order asc, gallery_photos.created_at asc").Find(&gallery)

	response.SuccessWithMessage(c, "Informasi pernikahan berhasil disimpan", gin.H{
		"couple":  couple,
		"gallery": gallery,
	})
}

