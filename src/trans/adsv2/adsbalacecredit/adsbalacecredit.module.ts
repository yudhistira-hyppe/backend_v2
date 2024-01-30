import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsPurposesController } from './adsbalacecredit.controller';
import { AdsBalaceCreditService } from './adsbalacecredit.service';
import { ConfigModule } from '@nestjs/config';
import { AdsBalaceCredit, AdsBalaceCreditSchema } from './schema/adsbalacecredit.schema';
import { UtilsModule } from '../../../utils/utils.module';
import { UserbasicsModule } from '../../../trans/userbasics/userbasics.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';

@Module({
    imports: [
        UserbasicnewModule,
        LogapisModule,
        UserbasicsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsBalaceCredit.name, schema: AdsBalaceCreditSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsPurposesController],
    providers: [AdsBalaceCreditService],
    exports: [AdsBalaceCreditService],
})
export class AdsBalaceCreditModule { }
