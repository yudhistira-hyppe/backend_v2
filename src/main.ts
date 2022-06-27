import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync('/home/ubuntu/workspace/SSL/hyppe.key'),
  cert: fs.readFileSync('/home/ubuntu/workspace/SSL/hyppe.crt'),
};


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    httpsOptions,
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