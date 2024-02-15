import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AdssettingService } from './adssetting.service';
import { AdsSettingController } from './adssetting.controller';
import { Settings2Schema, SettingsMixed } from 'src/trans/settings2/schemas/settings2.schema';
import { UtilsModule } from '../../../utils/utils.module';
import { AdsTypesModule } from '../adstype/adstype.module';
import { AdsNotificationService } from './adsnotification.service';
import { TemplatesRepoModule } from '../../../infra/templates_repo/templates_repo.module';
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';
import { AdslogsModule } from '../adslog/adslogs.module';
import { AdsObjectivitasModule } from '../adsobjectivitas/adsobjectivitas.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { AdsPriceCreditsModule } from '../adspricecredits/adspricecredits.module';
import { AdsRewardsModule } from '../adsrewards/adsrewards.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        UserbasicnewModule,
        AdsRewardsModule,
        LogapisModule,
        AdsPriceCreditsModule,
        AdsObjectivitasModule,
        AdslogsModule,
        //UserbasicsModule,
        TemplatesRepoModule,
        AdsTypesModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: SettingsMixed.name, schema: Settings2Schema }], 'SERVER_FULL')
    ],
    controllers: [AdsSettingController],
    providers: [AdssettingService, AdsNotificationService],
    exports: [AdssettingService, AdsNotificationService],
})
export class AdsSettingModule {}
