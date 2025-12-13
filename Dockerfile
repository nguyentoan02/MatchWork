# Stage 1: Build & Dependencies
# Sử dụng node:22-slim cho builder (nhẹ, Debian-based để hỗ trợ native modules)
FROM node:22-slim AS builder 
WORKDIR /app

# Cài đặt dependencies hệ thống nếu cần (ví dụ: cho native builds)
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Khai báo ARG/ENV (thống nhất với .env)
ARG VITE_API_BASE_URL 
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL 
ARG VITE_GOOGLE_CLIENT_ID 
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID 

# Copy package files trước để tận dụng Docker layer caching
COPY package.json package-lock.json ./

# Sử dụng npm ci cho cài đặt deterministic và nhanh hơn
RUN npm ci --only=production && npm cache clean --force

# Thêm bước xóa và cài lại để khắc phục bug npm với optional dependencies (nếu cần)
RUN rm -rf node_modules package-lock.json && npm ci --only=production

# Copy source code và build
COPY . .
RUN npm run build 

# Stage 2: Production Final Image (nginx:alpine để nhẹ)
FROM nginx:alpine AS runner 

# Tạo user non-root cho bảo mật (nginx mặc định chạy root, nhưng có thể switch)
RUN addgroup -g 1001 -S nginxuser && adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginxuser -g nginxuser nginxuser

# Copy file build từ builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình custom cho SPA (nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Chạy với user non-root (nếu nginx config hỗ trợ)
USER nginxuser

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]