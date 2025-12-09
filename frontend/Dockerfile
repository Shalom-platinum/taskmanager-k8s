# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Set environment variable to skip source map generation
ENV GENERATE_SOURCEMAP=false

# Copy package files
COPY package*.json ./

# Install dependencies - use npm install with force to resolve conflicts
RUN npm install

# Copy source code
COPY public/ ./public/
COPY src/ ./src/

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]