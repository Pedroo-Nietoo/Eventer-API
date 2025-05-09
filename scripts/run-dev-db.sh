#!/bin/bash

gum style \
	--foreground 212 --border-foreground 212 --border double \
	--align center --width 45 --margin "1 0" --padding "1" \
	'Nearby API - Database Initialization'

if ! docker ps --format '{{.Names}}' | grep -q '^nearby-db$'; then
	gum spin --spinner "dot" --title "🐳 Starting Docker Compose..." -- docker-compose -f docker/docker-compose-dev.yml --env-file .env up -d

	gum spin --spinner "dot" --title "Waiting Database to be ready..." -- bash -c '
	until docker exec nearby-db pg_isready -U nearby-admin -d nearby; do 
		gum style --foreground 019 "Aguardando aceite de conexões..." 
		sleep 2 
	done'
else
	gum style --foreground 212 "🐳 Docker Compose já está em execução."
fi

gum spin --spinner "dot" --title "Applying Prisma migrations..." -- npx prisma migrate deploy

gum spin --spinner "dot" --title "🍃 Applying Prisma seeds..." -- npx prisma db seed

echo ""

gum style --bold --foreground 212 "🚀 Database ready for use!"