import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Mediastiker, MediastikerSchema } from './schemas/mediastiker.schema';
import { MediastikerController } from './mediastiker.controller';
import { MediastikerService } from './mediastiker.service';
import { UtilsModule } from '../../utils/utils.module';
import { OssModule } from 'src/stream/oss/oss.module';

@Module({


  imports: [
    OssModule,
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Mediastiker.name, schema: MediastikerSchema },
    ], 'SERVER_FULL')
  ],
  controllers: [MediastikerController],
  providers: [MediastikerService],
  exports: [MediastikerService],
})
export class MediastikerModule { }
