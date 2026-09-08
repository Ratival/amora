package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type GalleryPhoto struct {
	ID         string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CoupleSlug string         `gorm:"type:varchar(100);index;default:''" json:"coupleSlug"`
	URL        string         `gorm:"not null" json:"url"`
	Caption    string         `json:"caption"`
	Order      int            `gorm:"default:0" json:"order"`
	CreatedAt  time.Time      `json:"createdAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (g *GalleryPhoto) BeforeCreate(tx *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.New().String()
	}
	return nil
}

type AddGalleryPhotoRequest struct {
	URL     string `json:"url" binding:"required"`
	Caption string `json:"caption"`
	Order   int    `json:"order"`
}
