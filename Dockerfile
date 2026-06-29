# ─── Stage 1: Build ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy root package.json so npm can resolve the "mxw01-print": "file:.." dep
COPY package.json ./

# Install printer-ui dependencies (use package-lock for reproducible builds)
COPY printer-ui/package.json printer-ui/package-lock.json ./printer-ui/
RUN cd printer-ui && npm ci

# Copy source and build
COPY printer-ui/ ./printer-ui/
RUN cd printer-ui && npm run build

# ─── Stage 2: Serve ─────────────────────────────────────────────────────────
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/printer-ui/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
