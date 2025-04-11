import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
        maxAge: 1000 * 60 * 60, // 1 Stunde
      },
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Community Game Admin API')
    .setDescription('API zur Verwaltung von Events, Gegnern, Umfragen etc.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
