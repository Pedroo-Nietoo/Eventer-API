#!/bin/bash

gum spin --spinner "dot" --title "🐳 Starting Docker Compose..." -- docker-compose up -d database

gum spin --spinner "dot" --title "Waiting Database to be ready..." -- bash -c '
until docker exec postgres pg_isready -U eventer-admin -d eventer; do 
  gum style --foreground 019 "Aguardando aceite de conexões..." 
  sleep 2 
done'


gum spin --spinner "dot" --title "Applying Prisma migrations..." -- npx prisma migrate deploy

gum spin --spinner "dot" --title "🍃 Applying Prisma seeds..." -- npx prisma db seed

echo ""

gum style --bold --foreground 212 "🚀 Database ready for use!"