import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbankaccountsController } from './userbankaccounts.controller';
import { UserbankaccountsService } from './userbankaccounts.service';
import { ConfigModule } from '@nestjs/config';
import { Userbankaccounts, UserbankaccountsSchema } from './schemas/userbankaccounts.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { BanksModule } from '../banks/banks.module';
@Module({
    imports: [

        ConfigModule.forRoot(), UserbasicsModule, BanksModule,
        MongooseModule.forFeature([{ name: Userbankaccounts.name, schema: UserbankaccountsSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserbankaccountsController],
    exports: [UserbankaccountsService],
    providers: [UserbankaccountsService],
})
export class UserbankaccountsModule { }
