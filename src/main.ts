// main.ts — put this at the very top
import * as nodeCrypto from 'crypto';

if (!(global as any).crypto) {
  // Expose Node's crypto module as global.crypto so libraries that expect a browser-like crypto work.
  (global as any).crypto = nodeCrypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

    app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove any unknown fields from the incoming requests body, params, query
      forbidNonWhitelisted: true, // also fire an error if there is unknown field in the incoming request
      transform: true, //enable the custom transformers, and make it works, like the trims
      transformOptions: { enableImplicitConversion: true }, // convert any 'digit' into digit implicitly , also the date, boolean ..etc
    }),
  );

  // CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' ? false : true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Get port from config
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
