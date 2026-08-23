# Админка (Vite/React) — статическая SPA-сборка, отдаётся через nginx.
# Яндекс.Карты используются без API-ключа (неавторизованный режим, как и
# на витрине domsommelier-frontend) — сознательное решение, чтобы не
# заводить и не ротировать отдельный секрет ради карты в форме винотеки.

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
