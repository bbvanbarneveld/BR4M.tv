FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_FOURTHWALL_STOREFRONT_TOKEN
ARG VITE_FOURTHWALL_CHECKOUT
ARG VITE_FOURTHWALL_CURRENCY
ENV VITE_FOURTHWALL_STOREFRONT_TOKEN=$VITE_FOURTHWALL_STOREFRONT_TOKEN
ENV VITE_FOURTHWALL_CHECKOUT=$VITE_FOURTHWALL_CHECKOUT
ENV VITE_FOURTHWALL_CURRENCY=$VITE_FOURTHWALL_CURRENCY
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
