package handlers

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/Ratival/amora/server/pkg/utils"
	"github.com/gin-gonic/gin"
)

// GetAdminOverview returns overall platform analytics
func (h *Handler) GetAdminOverview(c *gin.Context) {
	var totalCouples int64
	var publishedCouples int64
	var draftCouples int64
	var totalGuests int64
	var totalRSVPs int64
	var totalWishes int64

	h.db.Model(&models.Couple{}).Count(&totalCouples)
	h.db.Model(&models.Couple{}).Where("status = ?", "published").Count(&publishedCouples)
	h.db.Model(&models.Couple{}).Where("status = ?", "draft").Count(&draftCouples)
	h.db.Model(&models.Guest{}).Count(&totalGuests)
	h.db.Model(&models.Guest{}).Where("rsvp_status != ?", "Pending").Count(&totalRSVPs)
	h.db.Model(&models.Wish{}).Count(&totalWishes)

	var recentCouples []models.Couple
	h.db.Order("created_at desc").Limit(5).Find(&recentCouples)

	response.Success(c, gin.H{
		"stats": gin.H{
			"totalCouples":     totalCouples,
			"publishedCouples": publishedCouples,
			"draftCouples":     draftCouples,
			"totalGuests":      totalGuests,
			"totalRSVPs":       totalRSVPs,
			"totalWishes":      totalWishes,
		},
		"recentCouples": recentCouples,
	})
}

// ListCouples returns all couple wedding projects with pagination and search
func (h *Handler) ListCouples(c *gin.Context) {
	page := 1
	perPage := 100

	if p := c.Query("page"); p != "" {
		if val := parseInt(p); val > 0 {
			page = val
		}
	}

	if pp := c.Query("per_page"); pp != "" {
		if val := parseInt(pp); val > 0 {
			perPage = val
		}
	}

	status := c.Query("status")
	search := c.Query("search")

	query := h.db.Model(&models.Couple{})

	if status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("title ILIKE ? OR slug ILIKE ? OR owner_email ILIKE ? OR groom_name ILIKE ? OR bride_name ILIKE ?", searchPattern, searchPattern, searchPattern, searchPattern, searchPattern)
	}

	var total int64
	query.Count(&total)

	var couples []models.Couple
	query.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&couples)

	for i := range couples {
		var gCount int64
		h.db.Model(&models.Guest{}).Where("LOWER(couple_slug) = LOWER(?)", couples[i].Slug).Count(&gCount)
		couples[i].GuestCount = int(gCount)
	}

	response.Paginated(c, couples, page, perPage, total)
}

// CreateCouple creates a new wedding project and automatically provisions its user account
func (h *Handler) CreateCouple(c *gin.Context) {
	var req models.CreateCoupleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	slug := strings.TrimSpace(strings.ToLower(req.Slug))
	if slug == "" {
		slug = strings.ToLower(req.GroomName + "-" + req.BrideName)
	}

	// Check if active couple with same slug already exists
	var existing models.Couple
	if err := h.db.Where("LOWER(slug) = ?", slug).First(&existing).Error; err == nil {
		response.BadRequest(c, "Slug URL undangan sudah digunakan")
		return
	}

	// Hard delete any soft-deleted legacy record with same slug to prevent unique constraint conflict
	h.db.Unscoped().Where("LOWER(slug) = ?", slug).Delete(&models.Couple{})

	title := req.Title
	if title == "" {
		title = "The Wedding of " + req.GroomName + " & " + req.BrideName
	}

	status := req.Status
	if status == "" {
		status = "published"
	}

	couple := models.Couple{
		Slug:             slug,
		GroomName:        req.GroomName,
		BrideName:        req.BrideName,
		OwnerEmail:       req.OwnerEmail,
		WeddingDate:      req.WeddingDate,
		Title:            title,
		Status:           status,
		GuestCount:       0,
		QRCheckInEnabled: true,
	}

	if err := h.db.Create(&couple).Error; err != nil {
		response.InternalError(c, "Gagal membuat undangan pernikahan: "+err.Error())
		return
	}

	// 2. Automatically create or link couple user account
	rawPassword := req.Password
	if rawPassword == "" {
		rawPassword = "password123"
	}

	hashedPass, errHash := utils.HashPassword(rawPassword)
	if errHash == nil {
		var existingUser models.User
		if errUser := h.db.Unscoped().Where("LOWER(email) = LOWER(?)", req.OwnerEmail).First(&existingUser).Error; errUser != nil {
			newUser := models.User{
				Name:       req.GroomName + " & " + req.BrideName,
				Email:      req.OwnerEmail,
				Password:   hashedPass,
				Role:       "couple",
				CoupleSlug: slug,
				IsActive:   true,
			}
			h.db.Create(&newUser)
		} else {
			// Update and un-delete existing user with role and couple_slug
			h.db.Unscoped().Model(&existingUser).Updates(map[string]interface{}{
				"role":        "couple",
				"couple_slug": slug,
				"name":        req.GroomName + " & " + req.BrideName,
				"password":    hashedPass,
				"is_active":   true,
				"deleted_at":  nil,
			})
		}
	}

	response.Created(c, gin.H{
		"couple": couple,
		"credentials": gin.H{
			"email":    req.OwnerEmail,
			"password": rawPassword,
			"slug":     slug,
			"name":     req.GroomName + " & " + req.BrideName,
		},
	})
}

// DeleteCouple removes a wedding project, all associated relational data, and its uploaded media files
func (h *Handler) DeleteCouple(c *gin.Context) {
	id := c.Param("id")

	var couple models.Couple
	if err := h.db.Unscoped().Where("id = ? OR LOWER(slug) = LOWER(?)", id, id).First(&couple).Error; err != nil {
		response.NotFound(c, "Undangan pernikahan tidak ditemukan")
		return
	}

	slug := couple.Slug

	// 1. Cleanup attached user account permanently
	h.db.Unscoped().Where("LOWER(couple_slug) = LOWER(?) OR LOWER(email) = LOWER(?)", slug, couple.OwnerEmail).Delete(&models.User{})

	// 2. Delete related guests, wishes, gallery photos permanently
	h.db.Unscoped().Where("LOWER(couple_slug) = LOWER(?)", slug).Delete(&models.Guest{})
	h.db.Unscoped().Where("LOWER(couple_slug) = LOWER(?)", slug).Delete(&models.Wish{})
	h.db.Unscoped().Where("LOWER(couple_slug) = LOWER(?)", slug).Delete(&models.GalleryPhoto{})

	// 3. Delete physical uploaded media files in server/uploads/<slug>
	if slug != "" && slug != "template" {
		coupleUploadDir := filepath.Join(h.config.UploadPath, slug)
		_ = os.RemoveAll(coupleUploadDir)
	}

	// 4. Delete couple record from database permanently
	if err := h.db.Unscoped().Delete(&couple).Error; err != nil {
		response.InternalError(c, "Gagal menghapus data pasangan: "+err.Error())
		return
	}

	response.SuccessWithMessage(c, "Undangan, akun, data terkait, dan file upload berhasil dihapus", nil)
}

// GetPlatformSettings returns current platform configurations
func (h *Handler) GetPlatformSettings(c *gin.Context) {
	var setting models.PlatformSetting
	if err := h.db.First(&setting).Error; err != nil {
		// Create default if not present
		setting = models.PlatformSetting{
			SiteName:          "Amora SaaS Wedding Platform",
			MainDomain:        "amora.ratival.com",
			WAGatewayURL:      "https://api.fonnte.com/send",
			WAApiKey:          "amora_wa_live_992182049182",
			AllowRegistration: true,
		}
		h.db.Create(&setting)
	}

	response.Success(c, setting)
}

// UpdatePlatformSettings updates platform configuration
func (h *Handler) UpdatePlatformSettings(c *gin.Context) {
	var req models.UpdatePlatformSettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var setting models.PlatformSetting
	if err := h.db.First(&setting).Error; err != nil {
		setting = models.PlatformSetting{
			SiteName:          "Amora SaaS Wedding Platform",
			MainDomain:        "amora.ratival.com",
			WAGatewayURL:      "https://api.fonnte.com/send",
			WAApiKey:          "amora_wa_live_992182049182",
			AllowRegistration: true,
		}
		h.db.Create(&setting)
	}

	if req.SiteName != "" {
		setting.SiteName = req.SiteName
	}
	if req.MainDomain != "" {
		setting.MainDomain = req.MainDomain
	}
	if req.WAGatewayURL != "" {
		setting.WAGatewayURL = req.WAGatewayURL
	}
	if req.WAApiKey != "" {
		setting.WAApiKey = req.WAApiKey
	}
	if req.AllowRegistration != nil {
		setting.AllowRegistration = *req.AllowRegistration
	}

	h.db.Save(&setting)
	response.SuccessWithMessage(c, "Pengaturan platform berhasil disimpan", setting)
}

