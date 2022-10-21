import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediavideosService } from './mediavideos.service';
import { MediavideosController } from './mediavideos.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediavideos, MediavideosSchema } from './schemas/mediavideos.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediavideos.name, schema: MediavideosSchema }], 'SERVER_FULL')
    ],
    controllers: [MediavideosController],
    providers: [MediavideosService],
    exports: [MediavideosService],
})
export class MediavideosModule { }
