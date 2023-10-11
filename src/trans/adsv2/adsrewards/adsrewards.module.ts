import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from 'src/utils/utils.module';
import { AdsRewardsService } from './adsrewards.service';
import { AdsRewardsController } from './adsrewards.controller';
import { AdsRewards, AdsRewardsSchema } from './schema/adsrewards.schema';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsRewards.name, schema: AdsRewardsSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsRewardsController],
    providers: [AdsRewardsService],
    exports: [AdsRewardsService],
})
export class AdsRewardsModule { }
