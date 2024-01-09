import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UservouchersController } from './uservouchers.controller';
import { UservouchersService } from './uservouchers.service';
import { ConfigModule } from '@nestjs/config';
import { Uservouchers, UservouchersSchema } from './schemas/uservouchers.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { VouchersModule } from '../vouchers/vouchers.module';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';
@Module({
    imports: [
        UserbasicnewModule,
        ConfigModule.forRoot(), UserbasicsModule, VouchersModule, LogapisModule, UtilsModule,
        MongooseModule.forFeature([{ name: Uservouchers.name, schema: UservouchersSchema }], 'SERVER_FULL')
    ],
    controllers: [UservouchersController],
    providers: [UservouchersService],
    exports: [UservouchersService],

})
export class UservouchersModule { }
