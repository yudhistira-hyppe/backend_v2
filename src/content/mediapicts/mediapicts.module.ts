import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediapictsService } from './mediapicts.service';
import { MediapictsController } from './mediapicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediapicts, MediapictsSchema } from './schemas/mediapicts.schema';
import { MediadiariesModule } from '../../content/mediadiaries/mediadiaries.module';
import { MediavideosModule } from '../../content/mediavideos/mediavideos.module';
import { MediastoriesModule } from '../../content/mediastories/mediastories.module';
import { UtilsModule } from '../../utils/utils.module';
@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(), MediadiariesModule, MediavideosModule, MediastoriesModule,
        MongooseModule.forFeature([{ name: Mediapicts.name, schema: MediapictsSchema }], 'SERVER_FULL')
    ],
    controllers: [MediapictsController],
    providers: [MediapictsService],
    exports: [MediapictsService],
})
export class MediapictsModule { }
