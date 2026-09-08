package handlers

import (
	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/Ratival/amora/server/pkg/utils"
	"github.com/gin-gonic/gin"
)

func (h *Handler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var existingUser models.User
	if err := h.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		response.BadRequest(c, "Email sudah terdaftar")
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		response.InternalError(c, "Gagal memproses password")
		return
	}

	role := "couple"
	coupleSlug := req.CoupleSlug
	if coupleSlug == "" {
		coupleSlug = "couple-" + req.Name
	}

	user := models.User{
		Name:       req.Name,
		Email:      req.Email,
		Password:   hashedPassword,
		Role:       role,
		CoupleSlug: coupleSlug,
		IsActive:   true,
	}

	if err := h.db.Create(&user).Error; err != nil {
		response.InternalError(c, "Gagal membuat akun pengguna")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role, user.CoupleSlug, h.config.JWTSecret)
	if err != nil {
		response.InternalError(c, "Gagal membuat access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role, user.CoupleSlug, h.config.JWTSecret)
	if err != nil {
		response.InternalError(c, "Gagal membuat refresh token")
		return
	}

	response.Created(c, models.AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func (h *Handler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	var user models.User
	if err := h.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		adminEmail := h.config.AdminEmail
		if adminEmail == "" {
			adminEmail = "admin@ratival.com"
		}
		if req.Email == adminEmail {
			// Auto-provision initial admin user on the fly if not found in database
			adminPass := h.config.AdminPassword
			if adminPass == "" {
				adminPass = "amora@rativ2026"
			}
			hashedPass, _ := utils.HashPassword(adminPass)
			adminUser := models.User{
				Name:     "Admin Amora",
				Email:    req.Email,
				Password: hashedPass,
				Role:     "admin",
				IsActive: true,
			}
			if errCreate := h.db.Create(&adminUser).Error; errCreate == nil {
				user = adminUser
			} else {
				response.Unauthorized(c, "Email atau password salah")
				return
			}
		} else {
			response.Unauthorized(c, "Email atau password salah")
			return
		}
	}

	if !utils.CheckPassword(req.Password, user.Password) {
		response.Unauthorized(c, "Email atau password salah")
		return
	}

	if !user.IsActive {
		response.Unauthorized(c, "Akun telah dinonaktifkan")
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Email, user.Role, user.CoupleSlug, h.config.JWTSecret)
	if err != nil {
		response.InternalError(c, "Gagal membuat access token")
		return
	}

	refreshToken, err := utils.GenerateRefreshToken(user.ID, user.Email, user.Role, user.CoupleSlug, h.config.JWTSecret)
	if err != nil {
		response.InternalError(c, "Gagal membuat refresh token")
		return
	}

	response.Success(c, models.AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func (h *Handler) RefreshToken(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	claims, err := utils.ValidateToken(req.RefreshToken, h.config.JWTSecret)
	if err != nil {
		response.Unauthorized(c, "Refresh token tidak valid atau sudah kedaluwarsa")
		return
	}

	token, err := utils.GenerateToken(claims.UserID, claims.Email, claims.Role, claims.CoupleSlug, h.config.JWTSecret)
	if err != nil {
		response.InternalError(c, "Gagal membuat access token baru")
		return
	}

	response.Success(c, gin.H{"token": token})
}

func (h *Handler) GetMe(c *gin.Context) {
	userID, _ := c.Get("userId")

	var user models.User
	if err := h.db.Where("id = ?", userID).First(&user).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	response.Success(c, user)
}
