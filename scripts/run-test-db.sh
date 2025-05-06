#!/bin/bash

gum style \
	--foreground 121 --border-foreground 121 --border double \
	--align center --width 45 --margin "1 0" --padding "1" \
	'Eventer API - Test Database Initialization'

gum spin --spinner "dot" --title "🐳 Starting Docker Compose..." -- docker-compose -f docker/docker-compose-test.yml --env-file .env up -d

gum spin --spinner "dot" --title "Waiting Database to be ready..." -- bash -c '
until docker exec eventer-db pg_isready -U eventer-admin -d eventer; do 
  gum style --foreground 121 "Aguardando aceite de conexões..." 
  sleep 2 
done'


gum spin --spinner "dot" --title "Applying Prisma migrations..." -- npx prisma migrate deploy

gum spin --spinner "dot" --title "🍃 Applying Prisma seeds..." -- npx prisma db seed

echo ""

gum style --bold --foreground 121 "🚀 Database ready for use!"