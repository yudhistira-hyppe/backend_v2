import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediapictsService } from './mediapicts.service';
import { MediapictsController } from './mediapicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediapicts, MediapictsSchema } from './schemas/mediapicts.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediapicts.name, schema: MediapictsSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediapictsController],
    providers: [MediapictsService],
    exports: [MediapictsService],
})
export class MediapictsModule {}
