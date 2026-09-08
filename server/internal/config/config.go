package config

import (
	"fmt"
	"os"
	"strconv"
)

type Config struct {
	AppURL        string
	DatabaseURL   string
	JWTSecret     string
	ServerPort    string
	Environment   string
	UploadPath    string
	MaxFileSize   int64
	ResendFrom    string
	ResendAPIURL  string
	AdminEmail    string
	AdminPassword string
}

func Load() *Config {
	port := getEnv("APP_PORT", getEnv("SERVER_PORT", getEnv("PORT", "8080")))
	jwtSecret := getEnv("JWT_SECRET", "s/DP7oiKIhnfd6fyoNSlue48oQz7+y+Y/NAJde6OxzU=")
	appURL := getEnv("APP_URL", "http://localhost:5173")
	adminEmail := getEnv("ADMIN_EMAIL", "admin@ratival.com")
	adminPassword := getEnv("ADMIN_PASSWORD", "amora@rativ2026")

	// Construct DSN from DB_* fields if DATABASE_URL is not explicitly set
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		host := getEnv("DB_HOST", "localhost")
		portStr := getEnv("DB_PORT", "5432")
		user := getEnv("DB_USER", "admin")
		pass := getEnv("DB_PASSWORD", "admin")
		name := getEnv("DB_NAME", "amora")
		ssl := getEnv("DB_SSLMODE", "disable")

		if pass != "" {
			dbURL = fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s", host, portStr, user, pass, name, ssl)
		} else {
			dbURL = fmt.Sprintf("host=%s port=%s user=%s dbname=%s sslmode=%s", host, portStr, user, name, ssl)
		}
	}

	return &Config{
		AppURL:        appURL,
		DatabaseURL:   dbURL,
		JWTSecret:     jwtSecret,
		ServerPort:    port,
		Environment:   getEnv("ENVIRONMENT", "development"),
		UploadPath:    getEnv("UPLOAD_PATH", "./uploads"),
		MaxFileSize:   getEnvInt("MAX_FILE_SIZE", 50*1024*1024), // 50MB default for audio/photo
		ResendFrom:    getEnv("RESEND_FROM", "<no-reply>@amora.ratival.com"),
		ResendAPIURL:  getEnv("RESEND_API_URL", ""),
		AdminEmail:    adminEmail,
		AdminPassword: adminPassword,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvInt(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}
