import { AdsPriceCreditsController } from './adspricecredits.controller';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from 'src/utils/utils.module';
import { AdsPriceCredits, AdsPriceCreditsSchema } from './schema/adspricecredits.schema';
import { AdsPriceCreditsService } from './adspricecredits.service';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsPriceCredits.name, schema: AdsPriceCreditsSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsPriceCreditsController],
    providers: [AdsPriceCreditsService],
    exports: [AdsPriceCreditsService],
})
export class AdsPriceCreditsModule { }
