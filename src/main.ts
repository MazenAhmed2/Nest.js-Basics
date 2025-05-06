import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({  // Must be put to enable validation
    whitelist: true, // Allow the fields of schema only
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
