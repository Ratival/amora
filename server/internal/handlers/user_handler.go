package handlers

import (
	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/response"
	"github.com/Ratival/amora/server/pkg/utils"
	"github.com/gin-gonic/gin"
)

type CreateUserRequest struct {
	Name       string `json:"name" binding:"required,min=2,max=100"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	Role       string `json:"role"`
	CoupleSlug string `json:"coupleSlug"`
}

type UpdateUserRequest struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	Role       string `json:"role"`
	CoupleSlug string `json:"coupleSlug"`
	IsActive   *bool  `json:"isActive"`
}

func (h *Handler) ListUsers(c *gin.Context) {
	page := 1
	perPage := 50

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

	var total int64
	h.db.Model(&models.User{}).Count(&total)

	var users []models.User
	h.db.Offset((page - 1) * perPage).Limit(perPage).Order("created_at desc").Find(&users)

	response.Paginated(c, users, page, perPage, total)
}

func (h *Handler) GetUser(c *gin.Context) {
	id := c.Param("id")

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	response.Success(c, user)
}

func (h *Handler) CreateUser(c *gin.Context) {
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		response.InternalError(c, "Gagal memproses password")
		return
	}

	role := req.Role
	if role == "" {
		role = "couple"
	}

	var existing models.User
	if err := h.db.Unscoped().Where("LOWER(email) = LOWER(?)", req.Email).First(&existing).Error; err == nil {
		// Update existing or restored user
		h.db.Unscoped().Model(&existing).Updates(map[string]interface{}{
			"name":        req.Name,
			"password":    hashedPassword,
			"role":        role,
			"couple_slug": req.CoupleSlug,
			"is_active":   true,
			"deleted_at":  nil,
		})
		h.db.First(&existing, "id = ?", existing.ID)
		response.Created(c, existing)
		return
	}

	user := models.User{
		Name:       req.Name,
		Email:      req.Email,
		Password:   hashedPassword,
		Role:       role,
		CoupleSlug: req.CoupleSlug,
		IsActive:   true,
	}

	if err := h.db.Create(&user).Error; err != nil {
		response.InternalError(c, "Gagal menambahkan pengguna: "+err.Error())
		return
	}

	response.Created(c, user)
}

func (h *Handler) UpdateUser(c *gin.Context) {
	id := c.Param("id")

	currentUserID := c.GetString("userId")
	if currentUserID == id {
		response.BadRequest(c, "Tidak dapat mengubah akun Anda sendiri dari menu manajemen pengguna")
		return
	}

	var user models.User
	if err := h.db.Where("id = ?", id).First(&user).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	var req UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, err.Error())
		return
	}

	updates := make(map[string]interface{})

	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Password != "" {
		hashedPassword, err := utils.HashPassword(req.Password)
		if err != nil {
			response.InternalError(c, "Gagal memproses password")
			return
		}
		updates["password"] = hashedPassword
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.CoupleSlug != "" {
		updates["couple_slug"] = req.CoupleSlug
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if err := h.db.Model(&user).Updates(updates).Error; err != nil {
		response.InternalError(c, "Gagal memperbarui pengguna")
		return
	}

	h.db.First(&user, "id = ?", id)
	response.Success(c, user)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	id := c.Param("id")

	currentUserID := c.GetString("userId")
	if currentUserID == id {
		response.BadRequest(c, "Tidak dapat menghapus akun Anda sendiri")
		return
	}

	var user models.User
	if err := h.db.Unscoped().Where("id = ?", id).First(&user).Error; err != nil {
		response.NotFound(c, "Pengguna tidak ditemukan")
		return
	}

	if err := h.db.Unscoped().Delete(&user).Error; err != nil {
		response.InternalError(c, "Gagal menghapus pengguna")
		return
	}

	response.SuccessWithMessage(c, "Pengguna berhasil dihapus", nil)
}

