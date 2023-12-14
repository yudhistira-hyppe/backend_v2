import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../utils/utils.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { Mediastreaming, MediastreamingSchema } from './schema/mediastreaming.schema';
import { MediastreamingService } from './mediastreaming.service';
import { MediastreamingController } from './mediastreaming.controller';
import { MediastreamingalicloudService } from './mediastreamingalicloud.service';
import { SocketModule } from '../socket/socket.module';

@Module({
    imports: [
        SocketModule,
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediastreaming.name, schema: MediastreamingSchema }], 'SERVER_FULL')
    ],
    controllers: [MediastreamingController],
    providers: [MediastreamingService, MediastreamingalicloudService],
    exports: [MediastreamingService, MediastreamingalicloudService],
})
export class MediastreamingModule { }
