import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportreasonsController } from './reportreasons.controller';
import { ReportreasonsService } from './reportreasons.service';
import { ConfigModule } from '@nestjs/config';
import { Reportreasons, ReportreasonsSchema } from './schemas/reportreasons.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reportreasons.name, schema: ReportreasonsSchema }], 'SERVER_FULL')
    ],
    controllers: [ReportreasonsController],
    providers: [ReportreasonsService],
    exports: [ReportreasonsService],
})
export class ReportreasonsModule { }
