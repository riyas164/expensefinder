# Stage 1: Build static assets with Node.js
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Use --legacy-peer-deps to prevent peer dependency resolution conflicts with Vite/esbuild
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine-slim

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Built-in Nginx config for Cloud Run
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 8080;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name _;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

ENV PORT=8080
EXPOSE 8080

CMD ["sh", "-c", "sed -i \"s/listen 8080;/listen ${PORT};/g\" /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
