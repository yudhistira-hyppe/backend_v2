import { Module } from '@nestjs/common';
import { AdsLandingController } from './adslanding.controller';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../../utils/utils.module';
import { AdsLandingService } from './adslanding.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ads, AdsSchema } from 'src/trans/ads/schemas/ads.schema';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsLandingController],
    providers: [AdsLandingService],
    exports: [AdsLandingService],
})
export class AdsLandingModule { }
