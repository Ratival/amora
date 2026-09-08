package middleware

import (
	"net/http"
	"strings"

	"github.com/Ratival/amora/server/pkg/response"
	"github.com/Ratival/amora/server/pkg/utils"
	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Content-Type")
		c.Header("Access-Control-Max-Age", "86400")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header required")
			c.Abort()
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			response.Unauthorized(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(parts[1], jwtSecret)
		if err != nil {
			response.Unauthorized(c, "Invalid or expired token")
			c.Abort()
			return
		}

		// Set user info in context
		c.Set("userId", claims.UserID)
		c.Set("userEmail", claims.Email)
		c.Set("userRole", claims.Role)
		c.Set("coupleSlug", claims.CoupleSlug)

		c.Next()
	}
}

// RequireAdmin middleware ensures the user has role 'admin'
func RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("userRole")
		if !exists || role != "admin" {
			response.Forbidden(c, "Akses ditolak: Memerlukan hak akses Platform Admin")
			c.Abort()
			return
		}
		c.Next()
	}
}

// RequireCoupleOrAdmin ensures the user is either an Admin or the Couple owner of the requested slug
func RequireCoupleOrAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("userRole")
		if role == "admin" {
			c.Next()
			return
		}

		requestedSlug := c.Param("slug")
		userCoupleSlug, exists := c.Get("coupleSlug")

		if requestedSlug != "" {
			if !exists || !strings.EqualFold(strings.TrimSpace(userCoupleSlug.(string)), strings.TrimSpace(requestedSlug)) {
				response.Forbidden(c, "Akses ditolak: Anda tidak memiliki izin untuk mengelola undangan ini")
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
