import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WithdrawsController } from './withdraws.controller';
import { WithdrawsService } from './withdraws.service';
import { ConfigModule } from '@nestjs/config';
import { Withdraws, WithdrawsSchema } from './schemas/withdraws.schema';

@Module({
    imports: [

        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Withdraws.name, schema: WithdrawsSchema }], 'SERVER_FULL')
    ],
    controllers: [WithdrawsController],
    exports: [WithdrawsService],
    providers: [WithdrawsService],

})
export class WithdrawsModule { }
