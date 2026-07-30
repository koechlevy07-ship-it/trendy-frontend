import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CourtVenueModule } from './modules/court-venue/court-venue.module';

async function bootstrap() {
  const app = await NestFactory.create(CourtVenueModule);

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Volleyball Analytics - Court & Venue Management API')
    .setDescription('Chapter 13 Part 3 - Enterprise Engineering Specification')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Venues', 'Venue management operations')
    .addTag('Courts', 'Court management operations')
    .addTag('Cameras', 'Camera infrastructure management')
    .addTag('Calibrations', 'Camera calibration management')
    .addTag('Facilities', 'Facility management')
    .addTag('Equipment', 'Equipment inventory management')
    .addTag('Sensors', 'Environmental sensor management')
    .addTag('Maintenance', 'Maintenance operations')
    .addTag('Documents', 'Document management')
    .addTag('Coverage Zones', 'Camera coverage zone management')
    .addTag('Camera Profiles', 'Camera profile management')
    .addTag('Certifications', 'Certification management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Court & Venue Management API running on port ${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();