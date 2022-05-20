import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediadiariesService } from './Mediadiaries.service';
import { MediadiariesController } from './Mediadiaries.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediadiaries, MediadiariesSchema } from './schemas/Mediadiaries.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediadiaries.name, schema: MediadiariesSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediadiariesController],
    providers: [MediadiariesService],
    exports: [MediadiariesService],
})
export class MediadiariesModule {}
