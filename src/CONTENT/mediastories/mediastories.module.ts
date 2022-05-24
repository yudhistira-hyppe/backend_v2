import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediastoriesService } from './mediastories.service';
import { MediastoriesController } from './mediastories.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediastories, MediastoriesSchema } from './schemas/mediastories.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediastories.name, schema: MediastoriesSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediastoriesController],
    providers: [MediastoriesService],
    exports: [MediastoriesService],
})
export class MediastoriesModule {}
