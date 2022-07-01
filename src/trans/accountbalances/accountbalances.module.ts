import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountbalancesController } from './accountbalances.controller';
import { AccountbalancesService } from './accountbalances.service';
import { ConfigModule } from '@nestjs/config';
import { Accountbalances, AccountbalancesSchema } from './schemas/accountbalances.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';

@Module({
    imports: [

        ConfigModule.forRoot(), UserbasicsModule,
        MongooseModule.forFeature([{ name: Accountbalances.name, schema: AccountbalancesSchema }], 'SERVER_TRANS')
    ],
    controllers: [AccountbalancesController],
    exports: [AccountbalancesService],
    providers: [AccountbalancesService],

})
export class AccountbalancesModule { }
