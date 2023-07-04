import { AdslogsController } from './adslogs.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from 'src/utils/utils.module';
import { AdsLogs, AdsLogsSchema } from './schema/adslog.schema';
import { AdslogsService } from './adslog.service';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsLogs.name, schema: AdsLogsSchema }], 'SERVER_FULL')
    ],
    controllers: [
        AdslogsController, AdslogsController],
    providers: [AdslogsService],
    exports: [AdslogsService],
})
export class AdslogsModule { }
