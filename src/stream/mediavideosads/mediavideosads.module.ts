import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediavideosadsController } from './mediavideosads.controller';
import { MediavideosadsService } from './mediavideosads.service';
import { ConfigModule } from '@nestjs/config';
import { Mediavideosads, MediavideosadsSchema } from './schemas/mediavideosads.schema';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';

@Module({

    imports: [
        SeaweedfsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediavideosads.name, schema: MediavideosadsSchema }], 'SERVER_FULL')
    ],
    controllers: [MediavideosadsController],
    providers: [MediavideosadsService],
    exports: [MediavideosadsService],
})
export class MediavideosadsModule { }
