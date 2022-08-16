import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';
import { ConfigModule } from '@nestjs/config';
import { Vouchers, VouchersSchema } from './schemas/vouchers.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { SettingsModule } from '../settings/settings.module';
@Module({

    imports: [
        ConfigModule.forRoot(), UserbasicsModule, SettingsModule,
        MongooseModule.forFeature([{ name: Vouchers.name, schema: VouchersSchema }], 'SERVER_TRANS')
    ],
    controllers: [VouchersController],
    providers: [VouchersService],
    exports: [VouchersService],
})
export class VouchersModule { }
