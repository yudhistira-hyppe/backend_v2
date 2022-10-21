import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediadiariesService } from './mediadiaries.service';
import { MediadiariesController } from './mediadiaries.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediadiaries, MediadiariesSchema } from './schemas/mediadiaries.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediadiaries.name, schema: MediadiariesSchema }], 'SERVER_FULL')
    ],
    controllers: [MediadiariesController],
    providers: [MediadiariesService],
    exports: [MediadiariesService],
})
export class MediadiariesModule { }
