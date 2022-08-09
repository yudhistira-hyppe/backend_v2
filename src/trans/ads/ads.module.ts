import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { ConfigModule } from '@nestjs/config';
import { Ads, AdsSchema } from './schemas/ads.schema';
import { UservouchersModule } from '../uservouchers/uservouchers.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { CitiesModule } from '../../infra/cities/cities.module';
import { AdstypesModule } from '../adstypes/adstypes.module';
@Module({

    imports: [
        ConfigModule.forRoot(), UservouchersModule, UserbasicsModule, CitiesModule, AdstypesModule,
        MongooseModule.forFeature([{ name: Ads.name, schema: AdsSchema }], 'SERVER_TRANS')
    ],
    controllers: [AdsController],
    providers: [AdsService],
    exports: [AdsService],
})
export class AdsModule { }
