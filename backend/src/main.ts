import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(cookieParser());
  app.use(
    session({
      secret: 'ultrasecretkey', // oder aus .env lesen
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60, // 1h
        sameSite: 'lax', // nicht "strict"!
        secure: false, // darf über http laufen
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Community Game Admin API')
    .setDescription('API zur Verwaltung von Events, Gegnern, Umfragen etc.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
