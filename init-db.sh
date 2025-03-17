#!/bin/bash

gum spin --spinner "dot" --title "🐳 Iniciando Docker Compose..." -- docker-compose up -d database

gum spin --spinner "dot" --title "Aguardando o Banco de Dados estar pronto..." -- bash -c '
until docker exec postgres pg_isready -U eventer-admin -d eventer; do 
  gum style --foreground 019 "Aguardando aceite de conexões..." 
  sleep 2 
done'


gum spin --spinner "dot" --title "Aplicando migrations do Prisma..." -- npx prisma migrate deploy

echo ""

gum style --bold --foreground 212 "🚀 Banco de Dados pronto para uso!"