import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as admin from 'firebase-admin';

const serviceAccount = require('../serviceAccountKey.json'); // Ruta a tu archivo JSON de credenciales Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://users-eden.firebaseio.com', // URL de proyecto de Firebase
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.enableCors();
  await app.listen(3002);
}
bootstrap();
