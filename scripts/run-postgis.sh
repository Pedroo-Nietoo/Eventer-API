#!/bin/bash

gum style \
	--foreground 414 --border-foreground 414 --border double \
	--align center --width 45 --margin "1 0" --padding "1" \
	'Nearby PostGIS API - Database Initialization'

if ! docker ps --format '{{.Names}}' | grep -q '^nearby-postgis$'; then
  gum spin --spinner "dot" --title "🐳 Starting Docker Compose..." -- docker-compose -f docker/docker-compose-postgis.yml --env-file .env up -d

  gum spin --spinner "dot" --title "Waiting for PostgreSQL to be ready..." -- bash -c '
  until docker exec nearby-postgis pg_isready -U nearby-admin -d nearby > /dev/null 2>&1; do
    gum style --foreground 019 "Aguardando aceite de conexões..."
    sleep 2
  done
  '
else
  gum style --foreground 414 "🐳 Docker Compose is already running."
fi

gum spin --spinner "dot" --title "🔌 Enabling PostGIS extension..." -- \
  docker exec -i nearby-postgis psql -U nearby-admin -d nearby -c "CREATE EXTENSION IF NOT EXISTS postgis;"

gum spin --spinner "dot" --title "📦 Applying Prisma migrations..." -- npx prisma migrate deploy

gum spin --spinner "dot" --title "🍃 Applying Prisma seeds..." -- npx prisma db seed

gum spin --spinner "dot" --title "📌 Creating location index on Event table..." -- \
  docker exec -i nearby-postgis psql -U nearby-admin -d nearby -c 'CREATE INDEX idx_evento_location_gist ON "events" USING GIST (location);'

  gum spin --spinner "dot" --title "🔍 Verifying if 'location' column exists in 'events' table..." -- \
    docker exec -i nearby-postgis psql -U nearby-admin -d nearby -c "\d events" | grep -q "location" || \
    gum style --foreground 196 "⚠️  Column 'location' does not exist in 'events' table."

echo ""

gum style --bold --foreground 414 "🚀 Database ready for use!"
