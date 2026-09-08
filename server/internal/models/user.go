package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID         string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Name       string         `gorm:"default:'';not null" json:"name"`
	Email      string         `gorm:"uniqueIndex;not null" json:"email"`
	Password   string         `gorm:"default:''" json:"-"`
	Role       string         `gorm:"type:varchar(20);default:'couple'" json:"role"` // "admin" or "couple"
	CoupleSlug string         `gorm:"type:varchar(100)" json:"coupleSlug,omitempty"` // For couple accounts
	IsActive   bool           `gorm:"default:true" json:"isActive"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// DTOs
type RegisterRequest struct {
	Name       string `json:"name" binding:"required,min=2,max=100"`
	Email      string `json:"email" binding:"required,email"`
	Password   string `json:"password" binding:"required,min=6"`
	CoupleSlug string `json:"coupleSlug"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refreshToken"`
	User         User   `json:"user"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}
