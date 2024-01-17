import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { ConfigModule } from '@nestjs/config';
import { Ads, AdsSchema } from './schemas/ads.schema';
import { UservouchersModule } from '../uservouchers/uservouchers.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { AdstypesModule } from '../adstypes/adstypes.module';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';
import { MediaimageadsModule } from '../../stream/mediaimageads/mediaimageads.module';
import { UtilsModule } from '../../utils/utils.module';
import { MediavideosadsModule } from '../../stream/mediavideosads/mediavideosads.module';
import { SettingsModule } from '../settings/settings.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { AdsplacesModule } from '../adsplaces/adsplaces.module';
import { PostsModule } from '../../content/posts/posts.module';
import { LogapisModule } from '../logapis/logapis.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
//import { UserAdsModule } from '../userads/userads.module';
@Module({

    imports: [
        UserbasicnewModule,
        AdsplacesModule,
        LogapisModule,
        ConfigModule.forRoot(), UservouchersModule, UserbasicsModule, AdstypesModule, SeaweedfsModule, MediaimageadsModule, UtilsModule, MediavideosadsModule,
        SettingsModule, VouchersModule, PostsModule,
        MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule { }
