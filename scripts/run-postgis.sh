#!/bin/bash

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 45 --margin "1 0" --padding "1" \
	'Eventer API - Database Initialization'

gum spin --spinner "dot" --title "🐳 Starting Docker Compose..." -- docker-compose -f docker/docker-compose-postgis.yml --env-file .env up -d

gum spin --spinner "dot" --title "Waiting for PostgreSQL to be ready..." -- bash -c '
until docker exec eventer-postgis pg_isready -U eventer-admin -d eventer > /dev/null 2>&1; do
  gum style --foreground 019 "Aguardando aceite de conexões..."
  sleep 2
done
'

gum spin --spinner "dot" --title "🔌 Enabling PostGIS extension..." -- \
  docker exec -i eventer-postgis psql -U eventer-admin -d eventer -c "CREATE EXTENSION IF NOT EXISTS postgis;"

gum spin --spinner "dot" --title "📦 Applying Prisma migrations..." -- npx prisma migrate deploy

gum spin --spinner "dot" --title "🍃 Applying Prisma seeds..." -- npx prisma db seed

gum spin --spinner "dot" --title "📌 Creating location index on Event table..." -- \
  docker exec -i eventer-postgis psql -U eventer-admin -d eventer -c 'CREATE INDEX idx_evento_location_gist ON "events" USING GIST (location);'


echo ""

gum style --bold --foreground 212 "🚀 Database ready for use!"
