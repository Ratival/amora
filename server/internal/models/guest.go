package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Guest struct {
	ID          string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	CoupleSlug  string         `gorm:"type:varchar(100);index;default:''" json:"coupleSlug"`
	Name        string         `gorm:"not null" json:"name"`
	Phone       string         `json:"phone"`
	Category    string         `gorm:"type:varchar(50);default:'Sahabat'" json:"category"` // VIP, Keluarga, Sahabat, Rekan Kerja
	Pax         int            `gorm:"default:1" json:"pax"`
	RSVPStatus  string         `gorm:"type:varchar(20);default:'Pending'" json:"rsvpStatus"` // Attending, Tentative, Regret, Pending
	Attended    bool           `gorm:"default:false" json:"attended"` // Check-in status at venue
	CheckInTime string         `json:"checkInTime,omitempty"`
	TableNumber string         `json:"tableNumber,omitempty"`
	Message     string         `json:"message,omitempty"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (g *Guest) BeforeCreate(tx *gorm.DB) error {
	if g.ID == "" {
		g.ID = uuid.New().String()
	}
	return nil
}

// DTOs
type CreateGuestRequest struct {
	Name        string `json:"name" binding:"required"`
	Phone       string `json:"phone"`
	Category    string `json:"category"`
	Pax         int    `json:"pax"`
	TableNumber string `json:"tableNumber"`
}

type UpdateGuestRequest struct {
	Name        string `json:"name"`
	Phone       string `json:"phone"`
	Category    string `json:"category"`
	Pax         *int   `json:"pax"`
	RSVPStatus  string `json:"rsvpStatus"`
	Attended    *bool  `json:"attended"`
	CheckInTime string `json:"checkInTime"`
	TableNumber string `json:"tableNumber"`
	Message     string `json:"message"`
}

type PublicRSVPRequest struct {
	Name       string `json:"name" binding:"required"`
	Phone      string `json:"phone"`
	RSVPStatus string `json:"rsvpStatus" binding:"required"` // Attending, Tentative, Regret
	Pax        int    `json:"pax"`
	Message    string `json:"message"`
}
