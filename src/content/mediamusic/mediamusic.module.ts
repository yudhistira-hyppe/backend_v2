import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediamusicService } from './mediamusic.service';
import { MediamusicController } from './mediamusic.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediamusic, MediamusicSchema } from './schemas/mediamusic.schema';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        UserbasicnewModule,
        //UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediamusic.name, schema: MediamusicSchema }], 'SERVER_FULL')
    ],
    controllers: [MediamusicController],
    providers: [MediamusicService],
    exports: [MediamusicService],
})
export class MediamusicModule { }
