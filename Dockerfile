FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (cached)
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
RUN npm ci

# Copy source
COPY . .

# Build-time environment variables for Vite (must start with VITE_)
ARG VITE_API_BASE_URL
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_RAZORPAY_KEY_ID=${VITE_RAZORPAY_KEY_ID}

# Build the app
RUN npm run build

# Runtime image
FROM nginx:stable-alpine

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx config with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]