import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";

// const httpsOptions = {
//   key: fs.readFileSync('/home/ubuntu/workspace/SSL/hyppe.key'),
//   cert: fs.readFileSync('/home/ubuntu/workspace/SSL/hyppe.crt'),
// };

const httpsOptions = {
  key: fs.readFileSync('C:/ProjectHyppe/crt/server.key'),
  cert: fs.readFileSync('C:/ProjectHyppe/crt/server.crt'),
};


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });
  const configService: ConfigService = app.get(ConfigService);
  const adminConfig: ServiceAccount = {
    "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
    "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY') .replace(/\\n/g, '\n'),
    "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: configService.get<string>('FIREBASE_DATABASE_URL'),
  });
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();