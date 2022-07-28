import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { ConfigModule } from '@nestjs/config';
import { Transactions, TransactionsSchema } from './schemas/transactions.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { SettingsModule } from '../settings/settings.module';
import { MethodepaymentsModule } from '../methodepayments/methodepayments.module';
import { BanksModule } from '../banks/banks.module';
import { PostsModule } from '../../content/posts/posts.module';
import { Pph21sModule } from '../pph21s/pph21s.module';
import { AccountbalancesModule } from '../accountbalances/accountbalances.module';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { InsightsModule } from '../../content/insights/insights.module';
import { UserbankaccountsModule } from '../userbankaccounts/userbankaccounts.module';
import { WithdrawsModule } from '../withdraws/withdraws.module';
import { GetusercontentsModule } from '../getusercontents/getusercontents.module';
@Module({

    imports: [

        ConfigModule.forRoot(), GetusercontentsModule, UserbasicsModule, SettingsModule, MethodepaymentsModule, BanksModule, PostsModule, Pph21sModule, AccountbalancesModule, OyPgModule, InsightsModule, UserbankaccountsModule, WithdrawsModule,
        MongooseModule.forFeature([{ name: Transactions.name, schema: TransactionsSchema }], 'SERVER_TRANS')
    ],
    controllers: [TransactionsController],
    exports: [TransactionsService],
    providers: [TransactionsService],

})
export class TransactionsModule { }
