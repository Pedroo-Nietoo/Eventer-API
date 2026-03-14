import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
 const config = new DocumentBuilder()
  .setTitle('Nearby API 📍')
  .setDescription('API para gestão de eventos, ingressos e geolocalização.')
  .setVersion('1.0')
  .addBearerAuth({
   type: 'http',
   scheme: 'bearer',
   bearerFormat: 'JWT',
   name: 'JWT',
   description: 'Insira o token JWT',
   in: 'header',
  })
  .build();

 const document = SwaggerModule.createDocument(app, config);

 SwaggerModule.setup('api/docs', app, document, {
  swaggerOptions: {
   persistAuthorization: true,
  },
 });
}