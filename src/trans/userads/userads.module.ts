
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAdsController } from './userads.controller';
import { UserAdsService } from './userads.service';
import { ConfigModule } from '@nestjs/config';
import { UserAds, UserAdsSchema } from './schemas/userads.schema';
import { AdsModule } from '../ads/ads.module';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { ContenteventsModule } from '../../content/contentevents/contentevents.module';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
    imports: [
        ConfigModule.forRoot(), AdsModule, MediaprofilepictsModule, ContenteventsModule, LogapisModule, UtilsModule,
        MongooseModule.forFeature([{ name: UserAds.name, schema: UserAdsSchema }], 'SERVER_FULL')
    ],
    controllers: [UserAdsController],
    exports: [UserAdsService],
    providers: [UserAdsService]
})
export class UserAdsModule { }
