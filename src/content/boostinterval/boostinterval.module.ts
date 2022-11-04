import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoostintervalService } from './boostinterval.service';
import { BoostintervalController } from './boostinterval.controller';
import { ConfigModule } from '@nestjs/config';
import { Boostinterval, BoostintervalSchema } from './schemas/boostinterval.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Boostinterval.name, schema: BoostintervalSchema }],'SERVER_FULL')
    ],
    controllers: [BoostintervalController],
    providers: [BoostintervalService],
    exports: [BoostintervalService],

})
export class BoostintervalModule {}
