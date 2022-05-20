import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediastoriesService } from './Mediastories.service';
import { MediastoriesController } from './Mediastories.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediastories, MediastoriesSchema } from './schemas/Mediastories.schema';

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
