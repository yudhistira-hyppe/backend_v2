import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Mediastiker, MediastikerSchema } from './schemas/mediastiker.schema';
import { Countstiker, CountstikerSchema } from './schemas/countstiker.schema'; 
import { MediastikerController } from './mediastiker.controller';
import { MediastikerService } from './mediastiker.service';
import { UtilsModule } from '../../utils/utils.module';
import { OssModule } from 'src/stream/oss/oss.module';
import { CountstikerService } from './countstiker.service';

@Module({


  imports: [
    OssModule,
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Mediastiker.name, schema: MediastikerSchema },
      { name: Countstiker.name, schema: CountstikerSchema }
    ], 'SERVER_FULL')
  ],
  controllers: [MediastikerController],
  providers: [MediastikerService, CountstikerService],
  exports: [MediastikerService, CountstikerService],
})
export class MediastikerModule { }
