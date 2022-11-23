import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IntervalSessionService } from './intervarsession.service';
import { IntervalSessionController } from './intervarsession.controller';
import { ConfigModule } from '@nestjs/config';
import { Boostsession, BoostsessionSchema } from '../schemas/boostsession.schema';
import { BoostintervalModule } from '../../boostinterval/boostinterval.module';
import { UtilsModule } from '../../../utils/utils.module';
import { TransactionsModule } from '../../../trans/transactions/transactions.module';
import { BoostsessionModule } from '../boostsession.module'; 
import { OyPgModule } from '../../../paymentgateway/oypg/oypg.module';

@Module({

    imports: [
        OyPgModule,
        BoostsessionModule,
        TransactionsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Boostsession.name, schema: BoostsessionSchema }],'SERVER_FULL'),
        BoostintervalModule
    ],
    controllers: [IntervalSessionController],
    providers: [IntervalSessionService],
    exports: [IntervalSessionService],

})
export class IntervalSessionModule {}
