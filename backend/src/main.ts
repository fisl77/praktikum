import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Session & Cookies
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'ultrasecretkey',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60, // läuft nach einer Stunde ab
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Community Game Admin API')
    .setDescription('API zur Verwaltung von Events, Gegnern, Umfragen etc.')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'API-KEY',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
