import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BanksController } from './banks.controller';
import { BanksService } from './banks.service';
import { ConfigModule } from '@nestjs/config';
import { Banks, BanksSchema } from './schemas/banks.schema';
@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Banks.name, schema: BanksSchema }], 'SERVER_FULL')
    ],
    controllers: [BanksController],
    providers: [BanksService],
    exports: [BanksService],

})
export class BanksModule { }
