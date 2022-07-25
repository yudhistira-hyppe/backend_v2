import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { MediaproofpictsController } from './mediaproofpicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediaproofpicts, MediaproofpictsSchema } from './schemas/mediaproofpicts.schema';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { MulterModule } from '@nestjs/platform-express';
import { v4 as uuidv4 } from 'uuid';

@Module({

    imports: [
        ConfigModule.forRoot(), NestjsFormDataModule,

        MongooseModule.forFeature([{ name: Mediaproofpicts.name, schema: MediaproofpictsSchema }], 'SERVER_CONTENT')
    ],
    controllers: [MediaproofpictsController],
    providers: [MediaproofpictsService],
    exports: [MediaproofpictsService],

})
export class MediaproofpictsModule { }
