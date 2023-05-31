import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsPurposesController } from './adsbalacecredit.controller';
import { AdsBalaceCreditService } from './adsbalacecredit.service';
import { ConfigModule } from '@nestjs/config';
import { AdsBalaceCredit, AdsBalaceCreditSchema } from './schema/adsbalacecredit.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsBalaceCredit.name, schema: AdsBalaceCreditSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsPurposesController],
    providers: [AdsBalaceCreditService],
    exports: [AdsBalaceCreditService],
})
export class AdsBalaceCreditModule { }
