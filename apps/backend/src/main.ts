import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS — frontend (Nuxt 3) ile iletişim için
  app.enableCors({
    origin: true, // TODO: Vercel URL alındığında burayı spesifik domain ile değiştirin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe — tüm DTO'lar otomatik validate edilir
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter — hata mesajları düzgün formatlanır
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger Configuration
  const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');
  const config = new DocumentBuilder()
    .setTitle('RealityFlow API')
    .setDescription('Real estate transaction management system API documentation')
    .setVersion('1.0')
    .addTag('transactions')
    .addTag('dashboard')
    .addTag('users')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 RealityFlow Backend running on http://localhost:${port}`);
}
bootstrap();
