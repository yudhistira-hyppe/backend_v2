import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaimageadsController } from './mediaimageads.controller';
import { MediaimageadsService } from './mediaimageads.service';
import { ConfigModule } from '@nestjs/config';
import { Mediaimageads, MediaimageadsSchema } from './schemas/mediaimageads.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediaimageads.name, schema: MediaimageadsSchema }], 'SERVER_TRANS')
    ],
    controllers: [MediaimageadsController],
    providers: [MediaimageadsService],
    exports: [MediaimageadsService],

})
export class MediaimageadsModule { }
