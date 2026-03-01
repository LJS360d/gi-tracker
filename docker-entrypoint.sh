#!/bin/sh
set -e

DB_FILE="${ASTRO_DATABASE_FILE:-/app/data/gi-tracker.db}"

if [ ! -f "$DB_FILE" ]; then
  echo "First start: initializing database..."
  cp /app/data/gi-tracker.seed.db "$DB_FILE"
  echo "Running production seed..."
  bunx astro db execute db/seed_prod.ts
fi

exec "$@"
