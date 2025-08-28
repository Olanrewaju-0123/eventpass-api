# Multi-stage build for production optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source code
COPY . .
COPY --from=deps /app/node_modules ./node_modules

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 eventpass

# Copy built application
COPY --from=builder --chown=eventpass:nodejs /app/dist ./dist
COPY --from=builder --chown=eventpass:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=eventpass:nodejs /app/package.json ./package.json
COPY --from=builder --chown=eventpass:nodejs /app/prisma ./prisma

# Set environment
ENV NODE_ENV=production
ENV PORT=4000

# Expose port
EXPOSE 4000

# Switch to non-root user
USER eventpass

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

# Start the application
CMD ["node", "dist/index.js"]
