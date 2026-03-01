# --- Build stage ---
FROM oven/bun:1 AS build
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG SITE_URL
ENV SITE_URL=${SITE_URL}
RUN mkdir -p /app/data
ENV ASTRO_DATABASE_FILE=/app/data/gi-tracker.db
RUN bunx astro build
# Export schema only (drop dev seed data inserted by astro build)
RUN sqlite3 /app/data/gi-tracker.db ".schema" > /tmp/schema.sql \
    && rm /app/data/gi-tracker.db \
    && sqlite3 /app/data/gi-tracker.db < /tmp/schema.sql

# --- Runtime stage ---
FROM oven/bun:1-slim
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/db ./db
COPY --from=build /app/astro.config.mjs ./
COPY --from=build /app/data/gi-tracker.db /app/data/gi-tracker.seed.db
COPY docker-entrypoint.sh /app/

# Persistent directories (mount volumes here)
RUN mkdir -p /app/public/media /app/data && chmod +x /app/docker-entrypoint.sh
VOLUME /app/public/media
VOLUME /app/data

ENV HOST=0.0.0.0
ENV PORT=3000
ENV ASTRO_DATABASE_FILE=/app/data/gi-tracker.db
EXPOSE 3000

ENTRYPOINT ["tini", "--", "/app/docker-entrypoint.sh"]
CMD ["bun", "./dist/server/entry.mjs"]
