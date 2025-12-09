import 'dotenv/config';
import * as functions from 'firebase-functions';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module';

const expressServer = express();

const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.init();
  return app;
};

// Initialize NestJS on cold start
let nestAppInitialized = false;
const initializeNest = async () => {
  if (!nestAppInitialized) {
    await createNestServer(expressServer);
    nestAppInitialized = true;
  }
};

// Export the API function
export const api = functions.https.onRequest(async (req, res) => {
  await initializeNest();
  expressServer(req, res);
});
