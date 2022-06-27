import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';

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
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await app.listen(5000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();