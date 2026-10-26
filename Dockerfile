# ==========================================
# Multi-stage Dockerfile for Google Cloud Run
# ==========================================

# Stage 1: Build static assets with Node.js
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies with clean cache
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Serve production assets with Nginx
FROM nginx:alpine-slim

# Copy custom Nginx template for Cloud Run
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built frontend assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Cloud Run injects the PORT environment variable (default: 8080)
ENV PORT=8080
EXPOSE 8080

# Nginx 1.19+ docker image will automatically substitute ${PORT} from template
CMD ["nginx", "-g", "daemon off;"]
