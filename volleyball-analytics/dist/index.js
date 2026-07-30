"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const court_venue_module_1 = require("./modules/court-venue/court-venue.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(court_venue_module_1.CourtVenueModule);
    app.enableCors();
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Court & Venue Management API running on port ${port}`);
    console.log(`API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=index.js.map