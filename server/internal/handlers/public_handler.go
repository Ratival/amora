package handlers

import (
	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GetPublicInvitation returns all details needed to render the published wedding invitation page
func (h *Handler) GetPublicInvitation(c *gin.Context) {
	slug := c.Param("slug")
	if slug == "" {
		slug = "template"
	}

	var couple models.Couple
	err := h.db.Where("LOWER(slug) = LOWER(?)", slug).First(&couple).Error
	if err != nil {
		if slug == "default" || slug == "template" {
			couple = models.Couple{
				Slug:           "template",
				Title:          "Amora Wedding Invitation (Demo Template)",
				GroomName:      "Jim Halpert",
				GroomParents:   "Putra dari Bpk. Gerald Halpert & Ibu Betsy Halpert",
				GroomBio:       "A paper salesman with a penchant for pranks and eternal love for Pam.",
				GroomInstagram: "@jimhalpert",
				GroomPhoto:     "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
				BrideName:      "Pam Beesly",
				BrideParents:   "Putri dari Bpk. William Beesly & Ibu Helene Beesly",
				BrideBio:       "An artist, receptionist, and the love of Jim's life since day one.",
				BrideInstagram: "@pambeesly",
				BridePhoto:     "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
				WeddingDate:    "2026-10-24",
				AkadDate:       "Sabtu, 24 Oktober 2026",
				AkadTime:       "09:00 - 11:00 WIB",
				AkadVenue:      "Niagara Chapel & Garden",
				AkadAddress:    "Jl. Lembah Niagara No. 12, Bandung, Jawa Barat",
				AkadMapsURL:    "https://maps.google.com/?q=Bandung",
				ResepsiDate:    "Sabtu, 24 Oktober 2026",
				ResepsiTime:    "18:30 - 21:30 WIB",
				ResepsiVenue:   "The Grand Ballroom Dunder",
				ResepsiAddress: "Jl. Asia Afrika No. 88, Bandung, Jawa Barat",
				ResepsiMapsURL: "https://maps.google.com/?q=Bandung",
				StoryQuote:     "When you're a kid, you assume your parents are soulmates. My kids are gonna be right about that.",
				MusicTitle:     "Shape of My Heart",
				MusicArtist:    "Sting",
				MusicURL:       "/shape_of_my_heart.mp3",
				ThemeID:        "classic-monochrome",
				Status:         "published",
			}
		} else {
			response.NotFound(c, "Undangan tidak ditemukan atau belum dipublikasikan")
			return
		}
	}

	var gallery []models.GalleryPhoto
	h.db.Where("LOWER(couple_slug) = LOWER(?)", couple.Slug).Order("gallery_photos.order asc, gallery_photos.created_at asc").Find(&gallery)

	var wishes []models.Wish
	h.db.Where("LOWER(couple_slug) = LOWER(?)", couple.Slug).
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at desc")
		}).
		Order("is_pinned desc, created_at desc").Limit(100).Find(&wishes)

	response.Success(c, models.PublicInvitationResponse{
		Couple:  couple,
		Gallery: gallery,
		Wishes:  wishes,
	})
}

// SubmitPublicRSVP handles RSVP confirmation from an invited guest
func (h *Handler) SubmitPublicRSVP(c *gin.Context) {
	slug := c.Param("slug")

	var couple models.Couple
	if err := h.db.Where("LOWER(slug) = LOWER(?)", slug).First(&couple).Error; err != nil {
		response.NotFound(c, "Undangan pernikahan tidak ditemukan")
		return
	}

	var req models.PublicRSVPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	// Check if guest already exists by name or phone
	var guest models.Guest
	query := h.db.Where("LOWER(couple_slug) = LOWER(?) AND LOWER(name) = LOWER(?)", couple.Slug, req.Name)
	if req.Phone != "" {
		query = h.db.Where("LOWER(couple_slug) = LOWER(?) AND (LOWER(name) = LOWER(?) OR phone = ?)", couple.Slug, req.Name, req.Phone)
	}

	pax := req.Pax
	if pax <= 0 {
		pax = 1
	}

	if err := query.First(&guest).Error; err == nil {
		// Update existing guest
		guest.RSVPStatus = req.RSVPStatus
		guest.Pax = pax
		if req.Message != "" {
			guest.Message = req.Message
		}
		if req.Phone != "" {
			guest.Phone = req.Phone
		}
		h.db.Save(&guest)
	} else {
		// Create new guest entry
		guest = models.Guest{
			CoupleSlug: couple.Slug,
			Name:       req.Name,
			Phone:      req.Phone,
			Category:   "Sahabat",
			Pax:        pax,
			RSVPStatus: req.RSVPStatus,
			Message:    req.Message,
		}
		h.db.Create(&guest)
	}

	// If guest included a message, also add it to wishes
	if req.Message != "" {
		wish := models.Wish{
			CoupleSlug:      couple.Slug,
			GuestName:       req.Name,
			Relationship:    "Tamu Undangan",
			Message:         req.Message,
			AttendingStatus: req.RSVPStatus,
		}
		h.db.Create(&wish)
		h.db.Model(&couple).Update("wishes_count", gorm.Expr("wishes_count + ?", 1))
	}

	response.SuccessWithMessage(c, "Konfirmasi RSVP berhasil dikirim!", guest)
}

// SubmitPublicWish adds a guest greeting to the digital guestbook
func (h *Handler) SubmitPublicWish(c *gin.Context) {
	slug := c.Param("slug")

	var req models.PublicWishRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var couple models.Couple
	hasCouple := h.db.Where("LOWER(slug) = LOWER(?)", slug).First(&couple).Error == nil

	coupleSlug := slug
	if hasCouple {
		coupleSlug = couple.Slug
	} else if slug == "default" || slug == "" {
		coupleSlug = "template"
	}

	attending := req.AttendingStatus
	if attending == "" {
		attending = "Hadir"
	}

	relationship := req.Relationship
	if relationship == "" {
		relationship = "Tamu Undangan"
	}

	wish := models.Wish{
		CoupleSlug:      coupleSlug,
		GuestName:       req.GuestName,
		Relationship:    relationship,
		Message:         req.Message,
		AttendingStatus: attending,
	}

	if err := h.db.Create(&wish).Error; err != nil {
		response.InternalError(c, "Gagal mengirimkan ucapan")
		return
	}

	// Update total wishes counter for couple statistics
	if hasCouple {
		h.db.Model(&couple).Update("wishes_count", gorm.Expr("wishes_count + ?", 1))
	}

	response.Created(c, wish)
}

// GetPublicWishes returns all approved wishes for a couple's public page
func (h *Handler) GetPublicWishes(c *gin.Context) {
	slug := c.Param("slug")

	var wishes []models.Wish
	if err := h.db.Where("LOWER(couple_slug) = LOWER(?)", slug).
		Preload("Replies", func(db *gorm.DB) *gorm.DB {
			return db.Order("created_at desc")
		}).
		Order("is_pinned desc, created_at desc").Find(&wishes).Error; err != nil {
		response.InternalError(c, "Gagal memuat ucapan & doa")
		return
	}

	response.Success(c, wishes)
}
