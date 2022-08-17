import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsUserCompareController } from './adsusercompare.controller';
import { AdsUserCompareService } from './adsusercompare.service';
import { ConfigModule } from '@nestjs/config';
import { AdsModule } from '../ads.module';
import { UserAdsModule } from '../../../trans/userads/userads.module';
import { UtilsModule } from '../../../utils/utils.module';
import { AreasModule } from '../../../infra/areas/areas.module';
import { UserauthsModule } from '../../../trans/userauths/userauths.module';
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';

@Module({
    imports: [
        AreasModule,
        UserauthsModule,
        UserbasicsModule,
        UserAdsModule,
        UtilsModule,
        AdsModule, 
        ConfigModule.forRoot(), 
    ],
    controllers: [AdsUserCompareController],
    providers: [AdsUserCompareService],
    exports: [AdsUserCompareService],
})
export class AdsUserCompareModule { }
