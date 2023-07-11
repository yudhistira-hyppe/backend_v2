import { Module } from '@nestjs/common';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Ads, AdsSchema } from './schema/ads.schema';
import { ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../../utils/utils.module';
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';
import { AdsTypesModule } from '../adstype/adstype.module';
import { AdsBalaceCreditModule } from '../adsbalacecredit/adsbalacecredit.module';
import { AdsSettingModule } from '../adssetting/adssetting.module';
import { UserAdsModule } from '../../../trans/userads/userads.module';
import { PostsModule } from '../../../content/posts/posts.module';
import { AccountbalancesModule } from '../../../trans/accountbalances/accountbalances.module';
import { MediaprofilepictsModule } from 'src/content/mediaprofilepicts/mediaprofilepicts.module';
import { AdsplacesModule } from 'src/trans/adsplaces/adsplaces.module';
import { AdstypesModule } from 'src/trans/adstypes/adstypes.module';

@Module({
    imports: [
        AdstypesModule,
        AdsplacesModule,
        MediaprofilepictsModule,
        UserAdsModule,
        AccountbalancesModule,
        PostsModule,
        UserAdsModule,
        AdsSettingModule,
        AdsBalaceCreditModule,
        AdsTypesModule,
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule {}
