import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CourtVenueModule } from './modules/court-venue/court-venue.module';

async function bootstrap() {
  const app = await NestFactory.create(CourtVenueModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  const config = new DocumentBuilder()
    .setTitle('Volleyball Analytics - Court & Venue Management API')
    .setDescription('Chapter 13 Part 3 - Service Layer, Business Rules, Validation Framework, REST APIs, RBAC Integration & Domain Events')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Venues', 'Venue management operations')
    .addTag('Courts', 'Court management operations')
    .addTag('Cameras', 'Camera infrastructure operations')
    .addTag('Calibrations', 'Calibration profile operations')
    .addTag('Facilities', 'Facility management operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🏐 Volleyball Analytics - Court & Venue Management Module running on port ${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();