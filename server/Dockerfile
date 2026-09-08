# ----------------------
# 1. Dev environment
# ----------------------
FROM golang:1.26-alpine AS dev
WORKDIR /app

RUN apk add --no-cache git openssl tzdata

# Install Air for hot reload
RUN go install github.com/air-verse/air@latest

# Copy go mod files
COPY go.mod go.sum ./

RUN go mod download

COPY . .

EXPOSE 8080

# Run with hot reload
CMD ["air"]

# ----------------------
# 2. Base deps
# ----------------------
FROM golang:1.26-alpine AS deps
WORKDIR /app

RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

# ----------------------
# 3. Builder
# ----------------------
FROM golang:1.26-alpine AS builder
WORKDIR /app

RUN apk add --no-cache git

COPY --from=deps /app/go.mod /app/go.sum ./
RUN go mod download

COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server ./cmd/server

# ----------------------
# 4. Runner (standalone)
# ----------------------
FROM alpine:3.19 AS runner
WORKDIR /app

RUN apk add --no-cache tzdata ca-certificates

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy binary from builder
COPY --from=builder /app/server /app/server

# Copy .env if exists
COPY .env.example .env 2>/dev/null || true

EXPOSE 8080

ENTRYPOINT ["/app/server"]
