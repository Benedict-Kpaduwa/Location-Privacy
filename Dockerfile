FROM node:20-alpine AS frontend-build

WORKDIR /frontend

COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/package-lock.json* ./

RUN corepack enable && corepack prepare pnpm@latest --activate 2>/dev/null; \
    if [ -f pnpm-lock.yaml ]; then pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; fi

COPY frontend/ .

ARG VITE_API_URL=/api
ARG VITE_MAPBOX_TOKEN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN

RUN npm run build

FROM python:3.12-slim

RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY --from=frontend-build /frontend/dist /var/www/html

RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-available/default
COPY nginx.root.conf /etc/nginx/conf.d/app.conf

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000

CMD ["/start.sh"]
