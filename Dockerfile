# ----------------------
# 1. Builder
# ----------------------
FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=https://api.amora.ratival.com
ENV VITE_API_URL=$VITE_API_URL

COPY package.json bun.lock* package-lock.json* ./
RUN npm install

COPY . .

RUN npm run build

# ----------------------
# 2. Runner (Nginx SPA)
# ----------------------
FROM nginx:alpine AS runner

COPY --from=builder /app/build/client /usr/share/nginx/html

RUN printf 'server {\n\
    listen 3000;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
