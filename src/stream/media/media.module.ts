import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UtilsModule } from '../../utils/utils.module';
import { SeaweedfsModule } from '../seaweedfs/seaweedfs.module';
import { AwsModule } from '../aws/aws.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';


@Module({
  imports: [
    MediaproofpictsModule,
    UserbasicsModule,
    AwsModule,
    SeaweedfsModule,
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
