import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportreasonsController } from './reportreasons.controller';
import { ReportreasonsService } from './reportreasons.service';
import { ConfigModule } from '@nestjs/config';
import { Reportreasons, ReportreasonsSchema } from './schemas/reportreasons.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reportreasons.name, schema: ReportreasonsSchema }], 'SERVER_TRANS')
    ],
    controllers: [ReportreasonsController],
    providers: [ReportreasonsService],
    exports: [ReportreasonsService],
})
export class ReportreasonsModule { }
