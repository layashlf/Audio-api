import '../instrument';

import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const tempConfig = new ConfigService();
  const isDevelopment = tempConfig.get<string>('NODE_ENV') === 'development';

  let app;
  if (isDevelopment) {
    // Use HTTP for development
    app = await NestFactory.create(AppModule);
  } else {
    // Use HTTPS for production
    const httpsOptions = {
      key: fs.readFileSync('ssl/localhost-key.pem'),
      cert: fs.readFileSync('ssl/localhost.pem'),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser('layas'));
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: configService.get('FRONTEND_URL'),
    credentials: true, // if you're using cookies or auth headers
  });

  const config = new DocumentBuilder()
    .setTitle('My App API')
    .setDescription('The official API documentation for My App')
    .setVersion('1.0')
    .addBearerAuth() // Adds an "Authorize" button to test protected endpoints
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(configService.get('PORT') ?? 3000);
}
bootstrap();
