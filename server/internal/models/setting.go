package models

import (
	"time"

	"gorm.io/gorm"
)

type PlatformSetting struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	SiteName          string         `gorm:"default:'Amora SaaS Wedding Platform'" json:"siteName"`
	MainDomain        string         `gorm:"default:'amora.ratival.com'" json:"mainDomain"`
	WAGatewayURL      string         `gorm:"default:'https://api.fonnte.com/send'" json:"waGatewayUrl"`
	WAApiKey          string         `json:"waApiKey"`
	AllowRegistration bool           `gorm:"default:true" json:"allowRegistration"`
	UpdatedAt         time.Time      `json:"updatedAt"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

type UpdatePlatformSettingRequest struct {
	SiteName          string `json:"siteName"`
	MainDomain        string `json:"mainDomain"`
	WAGatewayURL      string `json:"waGatewayUrl"`
	WAApiKey          string `json:"waApiKey"`
	AllowRegistration *bool  `json:"allowRegistration"`
}
