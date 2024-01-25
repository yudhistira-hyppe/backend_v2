import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserbankaccountsController } from './userbankaccounts.controller';
import { UserbankaccountsService } from './userbankaccounts.service';
import { ConfigModule } from '@nestjs/config';
import { Userbankaccounts, UserbankaccountsSchema } from './schemas/userbankaccounts.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { BanksModule } from '../banks/banks.module';
import { MediaproofpictsModule } from '../../content/mediaproofpicts/mediaproofpicts.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { UtilsModule } from '../../utils/utils.module';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';
import { OssModule } from "../../stream/oss/oss.module";
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
@Module({
    imports: [

        UserbasicnewModule, ConfigModule.forRoot(), OssModule, UserbasicsModule, BanksModule, MediaproofpictsModule, NestjsFormDataModule, UtilsModule, SeaweedfsModule,
        MongooseModule.forFeature([{ name: Userbankaccounts.name, schema: UserbankaccountsSchema }], 'SERVER_FULL')
    ],
    controllers: [UserbankaccountsController],
    exports: [UserbankaccountsService],
    providers: [UserbankaccountsService],
})
export class UserbankaccountsModule { }
