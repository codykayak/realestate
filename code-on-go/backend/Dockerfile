FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY shared/package.json ./shared/
COPY backend/package.json ./backend/

RUN npm ci -w @code-on-go/shared -w @code-on-go/backend --include-workspace-root 2>/dev/null \
  || npm install -w @code-on-go/shared -w @code-on-go/backend --include-workspace-root

COPY shared ./shared
COPY backend ./backend

RUN npm run build -w @code-on-go/shared && npm run build -w @code-on-go/backend

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/backend/package.json ./backend/
COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 8080
CMD ["node", "backend/dist/index.js"]
