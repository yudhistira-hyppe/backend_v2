import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UtilsModule } from 'src/utils/utils.module';
import { VoucherPromo, VoucherPromoSchema } from './schemas/voucherpromo.schema';
import { VouvherpromoController } from './vouvherpromo.controller';
import { VoucherpromoService } from './voucherpromo.service';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: VoucherPromo.name, schema: VoucherPromoSchema }], 'SERVER_FULL')
    ],
    controllers: [VouvherpromoController],
    providers: [VoucherpromoService],
    exports: [VoucherpromoService],
})
export class VoucherpromoModule {}
