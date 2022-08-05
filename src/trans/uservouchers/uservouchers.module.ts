import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UservouchersController } from './uservouchers.controller';
import { UservouchersService } from './uservouchers.service';
import { ConfigModule } from '@nestjs/config';
import { Uservouchers, UservouchersSchema } from './schemas/uservouchers.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';

@Module({
    imports: [
        ConfigModule.forRoot(), UserbasicsModule,
        MongooseModule.forFeature([{ name: Uservouchers.name, schema: UservouchersSchema }], 'SERVER_TRANS')
    ],
    controllers: [UservouchersController],
    providers: [UservouchersService],
    exports: [UservouchersService],

})
export class UservouchersModule { }
