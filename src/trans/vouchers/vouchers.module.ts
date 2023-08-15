import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { ConfigModule } from '@nestjs/config';
import { Vouchers, VouchersSchema } from './schemas/vouchers.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { SettingsModule } from '../settings/settings.module';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';
@Module({

    imports: [
        ConfigModule.forRoot(), UserbasicsModule, SettingsModule, LogapisModule, UtilsModule,
        MongooseModule.forFeature([{ name: Vouchers.name, schema: VouchersSchema }], 'SERVER_FULL')
    ],
    controllers: [VouchersController],
    providers: [VouchersService],
    exports: [VouchersService],
})
export class VouchersModule { }
