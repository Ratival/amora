# ----------------------
# 1. Dev environment
# ----------------------
FROM oven/bun:1-alpine AS dev
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install

COPY . .

EXPOSE 5173

CMD ["bun", "run", "dev"]

# ----------------------
# 2. Development deps
# ----------------------
FROM oven/bun:1-alpine AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

# ----------------------
# 3. Builder
# ----------------------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY package.json bun.lock ./
RUN bun install

COPY . .

RUN bun run build

# ----------------------
# 4. Runner (production)
# ----------------------
FROM oven/bun:1-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY --from=builder /app/build ./build
COPY --from=builder /app/start.ts ./start.ts

EXPOSE 3000

CMD ["bun", "run", "start"]
