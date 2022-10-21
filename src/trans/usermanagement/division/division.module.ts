
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DivisionController } from './division.controller';
import { DivisionService } from './division.service';
import { ConfigModule } from '@nestjs/config';
import { Division, DivisionSchema } from './schemas/division.schema';
import { UtilsModule } from '../../../utils/utils.module';
import { UserbasicsModule } from '../../userbasics/userbasics.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(), UserbasicsModule,
        MongooseModule.forFeature([{ name: Division.name, schema: DivisionSchema }], 'SERVER_FULL')
    ],
    controllers: [DivisionController],
    exports: [DivisionService],
    providers: [DivisionService],
})
export class DivisionModule { }
