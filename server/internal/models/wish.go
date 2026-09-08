package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Wish struct {
	ID              string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CoupleSlug      string         `gorm:"type:varchar(100);index;default:''" json:"coupleSlug"`
	GuestName       string         `gorm:"not null" json:"guestName"`
	Relationship    string         `json:"relationship"` // Sahabat, Teman Kantor, Keluarga, dll.
	Message         string         `gorm:"type:text;not null" json:"message"`
	AttendingStatus string         `gorm:"type:varchar(20);default:'Hadir'" json:"attendingStatus"` // Hadir, Maaf Berhalangan
	IsPinned        bool           `gorm:"default:false" json:"isPinned"`
	CreatedAt       time.Time      `json:"createdAt"`
	UpdatedAt       time.Time      `json:"updatedAt"`
	Replies         []WishReply    `gorm:"foreignKey:WishID;constraint:OnDelete:CASCADE" json:"replies"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (w *Wish) BeforeCreate(tx *gorm.DB) error {
	if w.ID == "" {
		w.ID = uuid.New().String()
	}
	return nil
}

type WishReply struct {
	ID        string    `gorm:"primaryKey;type:varchar(36)" json:"id"`
	WishID    string    `gorm:"type:varchar(36);index;not null" json:"wishId"`
	Author    string    `gorm:"not null" json:"author"` // "Jim & Pam" (Pengantin)
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"createdAt"`
}

func (r *WishReply) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

// DTOs
type PublicWishRequest struct {
	GuestName       string `json:"guestName" binding:"required"`
	Relationship    string `json:"relationship"`
	Message         string `json:"message" binding:"required"`
	AttendingStatus string `json:"attendingStatus"`
}

type ReplyWishRequest struct {
	Message string `json:"message" binding:"required"`
}
