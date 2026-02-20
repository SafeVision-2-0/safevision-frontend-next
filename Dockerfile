# ===============================
# Stage 1 — Dependencies
# ===============================
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable

# Copy lock files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile


# ===============================
# Stage 2 — Builder
# ===============================
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable

# --- Build-time environment variables ---
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_AI_URL
ARG NEXT_PUBLIC_BASE_API_URL
ARG NEXT_PUBLIC_BASE_WEBSOCKET
ARG NEXT_PUBLIC_AI_MODEL

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_AI_URL=$NEXT_PUBLIC_BASE_AI_URL
ENV NEXT_PUBLIC_BASE_API_URL=$NEXT_PUBLIC_BASE_API_URL
ENV NEXT_PUBLIC_BASE_WEBSOCKET=$NEXT_PUBLIC_BASE_WEBSOCKET
ENV NEXT_PUBLIC_AI_MODEL=$NEXT_PUBLIC_AI_MODEL

ENV NEXT_TELEMETRY_DISABLED=1

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN echo "API URL is: $NEXT_PUBLIC_API_URL"

# Build app
RUN pnpm build


# ===============================
# Stage 3 — Runner
# ===============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup -S nodejs -g 1001
RUN adduser -S nextjs -u 1001

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
