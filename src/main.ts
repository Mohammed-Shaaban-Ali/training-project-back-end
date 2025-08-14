import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove any unknown fields from the incoming requests body, params, query
      forbidNonWhitelisted: true, // also fire an error if there is unknown field in the incoming request
      transform: true, //enable the custom transformers, and make it works, like the trims
      transformOptions: { enableImplicitConversion: true }, // convert any 'digit' into digit implicitly , also the date, boolean ..etc
    })
  )
  await app.listen(process.env.PORT ?? 3333);
}
bootstrap();
