import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UtilsModule } from '../../utils/utils.module';


@Module({
  imports: [
    UtilsModule,
    NestjsFormDataModule, 
    ConfigService,
    ConfigModule.forRoot()
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
