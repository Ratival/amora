package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Couple struct {
	ID         string         `gorm:"primaryKey;type:varchar(36)" json:"id"`
	Slug       string         `gorm:"type:varchar(100);uniqueIndex;not null" json:"slug"`
	Title      string         `gorm:"not null" json:"title"`
	OwnerEmail string         `gorm:"not null" json:"ownerEmail"`
	Status     string         `gorm:"type:varchar(20);default:'published'" json:"status"` // "published", "draft"

	// Groom Profile
	GroomName      string `json:"groomName"`
	GroomParents   string `json:"groomParents"`
	GroomBio       string `json:"groomBio"`
	GroomInstagram string `json:"groomInstagram"`
	GroomPhoto     string `json:"groomPhoto"`

	// Bride Profile
	BrideName      string `json:"brideName"`
	BrideParents   string `json:"brideParents"`
	BrideBio       string `json:"brideBio"`
	BrideInstagram string `json:"brideInstagram"`
	BridePhoto     string `json:"bridePhoto"`

	// Event Schedule: Akad Nikah / Holy Matrimony
	AkadDate    string `json:"akadDate"`
	AkadTime    string `json:"akadTime"`
	AkadVenue   string `json:"akadVenue"`
	AkadAddress string `json:"akadAddress"`
	AkadMapsURL string `json:"akadMapsUrl"`

	// Event Schedule: Resepsi / Wedding Reception
	ResepsiDate    string `json:"resepsiDate"`
	ResepsiTime    string `json:"resepsiTime"`
	ResepsiVenue   string `json:"resepsiVenue"`
	ResepsiAddress string `json:"resepsiAddress"`
	ResepsiMapsURL string `json:"resepsiMapsUrl"`

	// Wedding Date (Main Date)
	WeddingDate string `json:"weddingDate"`

	// Story Quote & Live Stream
	StoryQuote    string `json:"storyQuote"`
	LiveStreamURL string `json:"liveStreamUrl"`

	// Background Music
	MusicTitle  string `json:"musicTitle"`
	MusicArtist string `json:"musicArtist"`
	MusicURL    string `json:"musicUrl"`

	// Theme and Media Slots
	ThemeID       string `gorm:"default:'modern-minimalist'" json:"themeId"`
	HeroPhotoIDs  string `gorm:"type:text" json:"heroPhotoIds"`  // JSON array of photo IDs
	StoryPhotoIDs string `gorm:"type:text" json:"storyPhotoIds"` // JSON array of photo IDs
	StoryChapters string `gorm:"type:text" json:"storyChapters"` // JSON array of StoryChapter
	BankAccounts  string `gorm:"type:text" json:"bankAccounts"`  // JSON array of BankAccount

	// Invitation Settings
	IsPasswordProtected bool   `gorm:"default:false" json:"isPasswordProtected"`
	Password            string `json:"password,omitempty"`
	RSVPDeadline        string `json:"rsvpDeadline"`
	QRCheckInEnabled    bool   `gorm:"default:true" json:"qrCheckInEnabled"`
	GuestCount          int    `gorm:"default:250" json:"guestCount"`
	WishesCount         int    `gorm:"default:0" json:"wishesCount"`

	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *Couple) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

// DTOs
type CreateCoupleRequest struct {
	Slug        string `json:"slug" binding:"required,min=2,max=100"`
	GroomName   string `json:"groomName" binding:"required"`
	BrideName   string `json:"brideName" binding:"required"`
	OwnerEmail  string `json:"ownerEmail" binding:"required,email"`
	WeddingDate string `json:"weddingDate"`
	Title       string `json:"title"`
	Status      string `json:"status"`
	Password    string `json:"password"`
}

type UpdateCoupleRequest struct {
	Title          string `json:"title"`
	Status         string `json:"status"`
	GroomName      string `json:"groomName"`
	GroomParents   string `json:"groomParents"`
	GroomInstagram string `json:"groomInstagram"`
	BrideName      string `json:"brideName"`
	BrideParents   string `json:"brideParents"`
	BrideInstagram string `json:"brideInstagram"`
	AkadDate       string `json:"akadDate"`
	AkadTime       string `json:"akadTime"`
	AkadVenue      string `json:"akadVenue"`
	AkadAddress    string `json:"akadAddress"`
	AkadMapsURL    string `json:"akadMapsUrl"`
	ResepsiDate    string `json:"resepsiDate"`
	ResepsiTime    string `json:"resepsiTime"`
	ResepsiVenue   string `json:"resepsiVenue"`
	ResepsiAddress string `json:"resepsiAddress"`
	ResepsiMapsURL string `json:"resepsiMapsUrl"`
	WeddingDate    string `json:"weddingDate"`
	StoryQuote     string `json:"storyQuote"`
	LiveStreamURL  string `json:"liveStreamUrl"`
	MusicTitle     string `json:"musicTitle"`
	MusicArtist    string `json:"musicArtist"`
	MusicURL       string `json:"musicUrl"`
	ThemeID        string `json:"themeId"`
	HeroPhotoIDs   string `json:"heroPhotoIds"`
	StoryPhotoIDs  string `json:"storyPhotoIds"`
	StoryChapters  string `json:"storyChapters"`
	BankAccounts   string `json:"bankAccounts"`
	IsPasswordProtected *bool  `json:"isPasswordProtected"`
	Password            string `json:"password"`
	RSVPDeadline        string `json:"rsvpDeadline"`
	QRCheckInEnabled    *bool  `json:"qrCheckInEnabled"`
	GuestCount          *int   `json:"guestCount"`
}

type PublicInvitationResponse struct {
	Couple  Couple         `json:"couple"`
	Gallery []GalleryPhoto `json:"gallery"`
	Wishes  []Wish         `json:"wishes"`
}
