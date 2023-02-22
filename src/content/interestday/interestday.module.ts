import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterestdayService } from './interestday.service';
import { InterestdayController } from './interestday.controller';
import { ConfigModule } from '@nestjs/config';
import { Interestday, InterestdaySchema } from './schemas/interestday.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Interestday.name, schema: InterestdaySchema }], 'SERVER_FULL')
    ],
    controllers: [InterestdayController],
    providers: [InterestdayService],
    exports: [InterestdayService],
})
export class InterestdayModule { }