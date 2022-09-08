import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsUserCompareController } from './adsusercompare.controller';
import { AdsUserCompareService } from './adsusercompare.service';
import { ConfigModule } from '@nestjs/config';
import { AdsModule } from '../ads.module';
import { UserAdsModule } from '../../userads/userads.module';
import { UtilsModule } from '../../../utils/utils.module';
import { AreasModule } from '../../../infra/areas/areas.module';
import { UserauthsModule } from '../../userauths/userauths.module';
import { UserbasicsModule } from '../../userbasics/userbasics.module';
import { MediavideosadsModule } from '../../../stream/mediavideosads/mediavideosads.module';
import { AdstypesModule } from '../../adstypes/adstypes.module';
import { AccountbalancesModule } from '../../accountbalances/accountbalances.module';
import { AdsplacesModule } from '../../adsplaces/adsplaces.module';
import { UservouchersModule } from '../../uservouchers/uservouchers.module';
import { VouchersModule } from '../../vouchers/vouchers.module';

@Module({
    imports: [
        VouchersModule,
        UservouchersModule,
        AdsplacesModule,
        AccountbalancesModule,
        AdstypesModule,
        MediavideosadsModule,
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
