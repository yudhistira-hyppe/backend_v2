import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediavideosService } from './Mediavideos.service';
import { MediavideosController } from './Mediavideos.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediavideos, MediavideosSchema } from './schemas/Mediavideos.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediavideos.name, schema: MediavideosSchema }],'SERVER_CONTENT')
    ],
    controllers: [MediavideosController],
    providers: [MediavideosService],
    exports: [MediavideosService],
})
export class MediavideosModule {}
