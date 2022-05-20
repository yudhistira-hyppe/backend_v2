import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediapictsService } from './Mediapicts.service';
import { MediapictsController } from './Mediapicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediapicts, MediapictsSchema } from './schemas/Mediapicts.schema';

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
