import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OssController } from './oss.controller';
import { OssService } from './oss.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule,
    ConfigService,
    ConfigModule.forRoot()
  ],
  controllers: [OssController],
  providers: [OssService],
  exports: [OssService],
})
export class OssModule {}
