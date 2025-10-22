# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the TypeScript project
RUN npm run build

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Copy compiled JS files only (dist folder)
COPY --from=builder /app/dist ./dist

# Copy package.json for runtime deps
COPY package*.json ./

RUN npm install --only=production

# Expose port (change if backend uses different)
EXPOSE 5000

CMD ["node", "dist/app.js"]
