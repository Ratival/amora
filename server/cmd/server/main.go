package main

import (
	"log"
	"os"

	"github.com/Ratival/amora/server/internal/config"
	"github.com/Ratival/amora/server/internal/handlers"
	"github.com/Ratival/amora/server/internal/middleware"
	"github.com/Ratival/amora/server/pkg/database"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(".env", "../.env"); err != nil {
		log.Println("No .env or ../.env file found, using environment variables")
	}

	cfg := config.Load()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	database.SeedData(db)

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	r.Use(middleware.CORS())

	h := handlers.NewHandler(db, cfg)

	r.GET("/health", h.HealthCheck)

	api := r.Group("/api/v1")
	{
		// 1. Public Endpoints (Accessible by guests without token)
		pub := api.Group("/public")
		{
			pub.GET("/invitation/:slug", h.GetPublicInvitation)
			pub.POST("/invitation/:slug/rsvp", h.SubmitPublicRSVP)
			pub.POST("/invitation/:slug/wishes", h.SubmitPublicWish)
			pub.GET("/invitation/:slug/wishes", h.GetPublicWishes)
		}

		// 2. Auth Endpoints
		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
			auth.POST("/refresh", h.RefreshToken)
		}

		// 3. Protected Endpoints (Requires valid JWT)
		protected := api.Group("")
		protected.Use(middleware.Auth(cfg.JWTSecret))
		{
			protected.GET("/auth/me", h.GetMe)

			// 3a. Platform Admin Routes (Requires role: "admin")
			admin := protected.Group("/admin")
			admin.Use(middleware.RequireAdmin())
			{
				admin.GET("/overview", h.GetAdminOverview)
				admin.GET("/couples", h.ListCouples)
				admin.POST("/couples", h.CreateCouple)
				admin.DELETE("/couples/:id", h.DeleteCouple)
				admin.GET("/settings", h.GetPlatformSettings)
				admin.PUT("/settings", h.UpdatePlatformSettings)

				admin.GET("/users", h.ListUsers)
				admin.GET("/users/:id", h.GetUser)
				admin.POST("/users", h.CreateUser)
				admin.PUT("/users/:id", h.UpdateUser)
				admin.DELETE("/users/:id", h.DeleteUser)
			}

			// 3b. Couple Dashboard Routes (Scoped to slug: Admin OR Owner Couple)
			couple := protected.Group("/couples/:slug")
			couple.Use(middleware.RequireCoupleOrAdmin())
			{
				couple.GET("", h.GetCoupleDashboardDetails)
				couple.PUT("", h.UpdateCouple)

				// Guest Management & QR Check-in
				couple.GET("/guests", h.ListGuests)
				couple.POST("/guests", h.CreateGuest)
				couple.PUT("/guests/:id", h.UpdateGuest)
				couple.DELETE("/guests/:id", h.DeleteGuest)
				couple.POST("/guests/:id/checkin", h.ToggleGuestCheckIn)

				// Wishes & Guestbook Interactions
				couple.GET("/wishes", h.ListWishes)
				couple.PUT("/wishes/:id/pin", h.TogglePinWish)
				couple.POST("/wishes/:id/reply", h.ReplyWish)
				couple.DELETE("/wishes/:id", h.DeleteWish)

				// Prewedding Gallery Photos
				couple.GET("/gallery", h.ListGalleryPhotos)
				couple.POST("/gallery", h.AddGalleryPhoto)
				couple.PUT("/gallery/:id", h.UpdateGalleryPhoto)
				couple.DELETE("/gallery/:id", h.DeleteGalleryPhoto)
			}

			// Media Asset Uploads
			files := protected.Group("/files")
			{
				files.POST("/upload", h.UploadFile)
				files.GET("/:filename", h.ServeFile)
				files.DELETE("/:filename", h.DeleteFile)
			}

			protected.GET("/ws", h.WebSocket)
		}
	}

	r.Static("/uploads", cfg.UploadPath)

	port := cfg.ServerPort
	if port == "" {
		port = "8080"
	}

	log.Printf("Amora Backend Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
