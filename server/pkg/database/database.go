package database

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/Ratival/amora/server/internal/models"
	"github.com/Ratival/amora/server/pkg/utils"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func Connect(dsn string) (*gorm.DB, error) {
	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}

	// Connection pool settings
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	log.Println("Database connected successfully")
	return db, nil
}

func Migrate(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// 1. Clean up legacy columns in PostgreSQL safely with IF EXISTS
	legacyStatements := []string{
		"ALTER TABLE IF EXISTS wishes DROP COLUMN IF EXISTS guest_id CASCADE",
		"ALTER TABLE IF EXISTS wishes DROP COLUMN IF EXISTS invitation_id CASCADE",
		"ALTER TABLE IF EXISTS wishes DROP COLUMN IF EXISTS couple_id CASCADE",
		"ALTER TABLE IF EXISTS wishes DROP COLUMN IF EXISTS user_id CASCADE",
		"ALTER TABLE IF EXISTS guests DROP COLUMN IF EXISTS invitation_id CASCADE",
		"ALTER TABLE IF EXISTS guests DROP COLUMN IF EXISTS couple_id CASCADE",
		"ALTER TABLE IF EXISTS guests DROP COLUMN IF EXISTS user_id CASCADE",
		"ALTER TABLE IF EXISTS gallery_photos DROP COLUMN IF EXISTS invitation_id CASCADE",
		"ALTER TABLE IF EXISTS gallery_photos DROP COLUMN IF EXISTS couple_id CASCADE",
		"ALTER TABLE IF EXISTS gallery_photos DROP COLUMN IF EXISTS user_id CASCADE",
		"ALTER TABLE IF EXISTS wish_replies DROP COLUMN IF EXISTS invitation_id CASCADE",
		"ALTER TABLE IF EXISTS wish_replies DROP COLUMN IF EXISTS couple_id CASCADE",
		"ALTER TABLE IF EXISTS wish_replies DROP COLUMN IF EXISTS guest_id CASCADE",
		"ALTER TABLE IF EXISTS wish_replies DROP COLUMN IF EXISTS user_id CASCADE",
		"ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS password_hash CASCADE",
		"ALTER TABLE IF EXISTS users DROP COLUMN IF EXISTS couple_id CASCADE",
		"ALTER TABLE IF EXISTS couples DROP COLUMN IF EXISTS invitation_id CASCADE",
		"ALTER TABLE IF EXISTS couples DROP COLUMN IF EXISTS user_id CASCADE",
	}
	for _, stmt := range legacyStatements {
		_ = db.Exec(stmt).Error
	}

	// 2. Pre-populate columns with safe defaults if tables already exist with rows
	preMigrateStatements := []string{
		"ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS name text DEFAULT ''",
		"UPDATE users SET name = '' WHERE name IS NULL",
		"ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS email text DEFAULT ''",
		"UPDATE users SET email = '' WHERE email IS NULL",
		"ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS password text DEFAULT ''",
		"UPDATE users SET password = '' WHERE password IS NULL",
		"ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS role varchar(20) DEFAULT 'couple'",
		"UPDATE users SET role = 'couple' WHERE role IS NULL",
		"ALTER TABLE IF EXISTS couples ADD COLUMN IF NOT EXISTS title text DEFAULT ''",
		"UPDATE couples SET title = '' WHERE title IS NULL",
		"ALTER TABLE IF EXISTS couples ADD COLUMN IF NOT EXISTS owner_email text DEFAULT ''",
		"UPDATE couples SET owner_email = '' WHERE owner_email IS NULL",
		"ALTER TABLE IF EXISTS guests ADD COLUMN IF NOT EXISTS name text DEFAULT ''",
		"UPDATE guests SET name = '' WHERE name IS NULL",
		"ALTER TABLE IF EXISTS wishes ADD COLUMN IF NOT EXISTS guest_name text DEFAULT ''",
		"UPDATE wishes SET guest_name = '' WHERE guest_name IS NULL",
		"ALTER TABLE IF EXISTS wishes ADD COLUMN IF NOT EXISTS message text DEFAULT ''",
		"UPDATE wishes SET message = '' WHERE message IS NULL",
	}
	for _, stmt := range preMigrateStatements {
		_ = db.Exec(stmt).Error
	}

	// 3. GORM Migrator checks
	m := db.Migrator()
	if m.HasColumn(&models.User{}, "password_hash") {
		_ = m.DropColumn(&models.User{}, "password_hash")
	}
	if m.HasTable("wishes") {
		_ = m.DropColumn(&models.Wish{}, "guest_id")
		_ = m.DropColumn(&models.Wish{}, "invitation_id")
		_ = m.DropColumn(&models.Wish{}, "couple_id")
	}
	if m.HasTable("guests") {
		_ = m.DropColumn(&models.Guest{}, "invitation_id")
		_ = m.DropColumn(&models.Guest{}, "couple_id")
	}
	if m.HasTable("gallery_photos") {
		_ = m.DropColumn(&models.GalleryPhoto{}, "invitation_id")
		_ = m.DropColumn(&models.GalleryPhoto{}, "couple_id")
	}
	if m.HasTable("wish_replies") {
		_ = m.DropColumn(&models.WishReply{}, "invitation_id")
		_ = m.DropColumn(&models.WishReply{}, "couple_id")
		_ = m.DropColumn(&models.WishReply{}, "guest_id")
	}

	err := db.AutoMigrate(
		&models.User{},
		&models.Couple{},
		&models.Guest{},
		&models.Wish{},
		&models.WishReply{},
		&models.GalleryPhoto{},
		&models.PlatformSetting{},
	)
	if err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Ensure any legacy NULL column values are normalized using GORM ORM queries
	db.Model(&models.User{}).Where("password IS NULL").Update("password", "")
	db.Model(&models.Guest{}).Where("couple_slug IS NULL").Update("couple_slug", "")
	db.Model(&models.Wish{}).Where("couple_slug IS NULL").Update("couple_slug", "")
	db.Model(&models.GalleryPhoto{}).Where("couple_slug IS NULL").Update("couple_slug", "")
	log.Println("Database migrations completed")

	// Seed initial data
	SeedData(db)

	return nil
}

func SeedData(db *gorm.DB) {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "admin@ratival.com"
	}
	adminEmail = strings.TrimSpace(strings.ToLower(adminEmail))
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "amora@rativ2026"
	}
	adminPassword = strings.TrimSpace(adminPassword)
	hashedPass, _ := utils.HashPassword(adminPassword)

	// 1. Clean up legacy boilerplate accounts and ensure ONLY 1 Super Admin exists
	db.Unscoped().Where("email LIKE ? OR email LIKE ?", "%@amora.id", "%@amora.io").Delete(&models.User{})
	db.Unscoped().Where("email IN ?", []string{"romeo.juliet@ratival.com", "devano.clara@ratival.com", "demo@amora.id", "jim.pam@ratival.com"}).Delete(&models.User{})
	db.Unscoped().Where("slug IN ?", []string{"romeo-juliet", "devano-clara", "jim-pam"}).Delete(&models.Couple{})
	db.Unscoped().Where("role = ? AND LOWER(email) != LOWER(?)", "admin", adminEmail).Delete(&models.User{})

	var adminUser models.User
	err := db.Unscoped().Where("LOWER(email) = LOWER(?)", adminEmail).First(&adminUser).Error
	if err != nil {
		adminUser = models.User{
			Name:     "Admin Amora",
			Email:    adminEmail,
			Password: hashedPass,
			Role:     "admin",
			IsActive: true,
		}
		if errCreate := db.Create(&adminUser).Error; errCreate == nil {
			log.Printf("Super admin user successfully initialized: %s\n", adminEmail)
		}
	} else {
		db.Unscoped().Model(&adminUser).Updates(map[string]interface{}{
			"name":       "Admin Amora",
			"email":      adminEmail,
			"password":   hashedPass,
			"role":       "admin",
			"is_active":  true,
			"deleted_at": nil,
		})
	}

	// 2. Seed Platform Settings
	var settingsCount int64
	db.Model(&models.PlatformSetting{}).Count(&settingsCount)
	if settingsCount == 0 {
		setting := models.PlatformSetting{
			SiteName:          "Amora",
			MainDomain:        "amora.ratival.com",
			WAGatewayURL:      "https://api.fonnte.com/send",
			WAApiKey:          "amora_wa_live_992182049182",
			AllowRegistration: true,
		}
		db.Create(&setting)
		log.Println("Default platform settings seeded")
	}

	// 3. Clean up legacy 'jim-pam' seeded data so database remains clean for production
	db.Unscoped().Where("couple_slug = ? OR slug = ?", "jim-pam", "jim-pam").Delete(&models.Couple{})
	db.Unscoped().Where("couple_slug = ?", "jim-pam").Delete(&models.Guest{})
	db.Unscoped().Where("couple_slug = ?", "jim-pam").Delete(&models.Wish{})
	db.Unscoped().Where("couple_slug = ?", "jim-pam").Delete(&models.GalleryPhoto{})
	db.Unscoped().Where("email = ?", "jim.pam@ratival.com").Delete(&models.User{})

	// 4. Seed default template couple if not present
	var templateCouple models.Couple
	if err := db.Unscoped().Where("LOWER(slug) = ?", "template").First(&templateCouple).Error; err != nil {
		templateCouple = models.Couple{
			ID:             "cpl-template",
			Slug:           "template",
			Title:          "Amora Wedding Invitation (Demo Template)",
			OwnerEmail:     "admin@ratival.com",
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
			LiveStreamURL:  "",
			ThemeID:        "classic-monochrome",
			Status:         "published",
			RSVPDeadline:   "2026-10-10",
			GuestCount:     0,
			MusicTitle:     "Shape of My Heart",
			MusicArtist:    "Sting",
			MusicURL:       "/shape_of_my_heart.mp3",
			StoryQuote:     "When you're a kid, you assume your parents are soulmates. My kids are gonna be right about that.",
		}
		db.Create(&templateCouple)
		log.Println("Default template couple successfully seeded: template")
	}

	// 5. Synchronize real live counts from database tables
	var allCouples []models.Couple
	db.Find(&allCouples)
	for _, c := range allCouples {
		var realGuestsCount int64
		var realWishesCount int64
		db.Model(&models.Guest{}).Where("LOWER(couple_slug) = LOWER(?)", c.Slug).Count(&realGuestsCount)
		db.Model(&models.Wish{}).Where("LOWER(couple_slug) = LOWER(?)", c.Slug).Count(&realWishesCount)
		db.Model(&models.Couple{}).Where("id = ?", c.ID).Updates(map[string]interface{}{
			"guest_count":  realGuestsCount,
			"wishes_count": realWishesCount,
		})
	}
}

