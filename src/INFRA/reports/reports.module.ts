import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsService } from './Reports.service';
import { ReportsController } from './Reports.controller';
import { ConfigModule } from '@nestjs/config';
import { Reports, ReportsSchema } from './schemas/Reports.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Reports.name, schema: ReportsSchema }],'SERVER_INFRA')
    ],
    controllers: [ReportsController],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule {}
