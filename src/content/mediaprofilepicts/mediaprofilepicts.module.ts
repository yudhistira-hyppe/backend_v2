import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaprofilepictsService } from './mediaprofilepicts.service';
import { MediaprofilepictsController } from './mediaprofilepicts.controller';
import { ConfigModule } from '@nestjs/config';
import { Mediaprofilepicts, MediaprofilepictsSchema } from './schemas/mediaprofilepicts.schema';
import { OssModule } from 'src/stream/oss/oss.module';

@Module({
    imports: [
        OssModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Mediaprofilepicts.name, schema: MediaprofilepictsSchema }], 'SERVER_FULL')
    ],
    controllers: [MediaprofilepictsController],
    providers: [MediaprofilepictsService],
    exports: [MediaprofilepictsService],
})
export class MediaprofilepictsModule { }
