
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAdsController } from './userads.controller';
import { UserAdsService } from './userads.service';
import { ConfigModule } from '@nestjs/config';
import { UserAds, UserAdsSchema } from './schemas/userads.schema';
import { UtilsModule } from '../../utils/utils.module';
import { AdsModule } from '../ads/ads.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { AreasModule } from '../../infra/areas/areas.module';

@Module({
    imports: [
        AreasModule,
        UserauthsModule,
        UserbasicsModule,
        AdsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: UserAds.name, schema: UserAdsSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserAdsController],
    providers: [UserAdsService]
})
export class UserAdsModule { }
