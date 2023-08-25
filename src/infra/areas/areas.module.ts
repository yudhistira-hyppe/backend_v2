import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreasService } from './areas.service';
import { AreasController } from './areas.controller';
import { ConfigModule } from '@nestjs/config';
import { Areas, AreasSchema } from './schemas/areas.schema';
import { LogapisModule } from 'src/trans/logapis/logapis.module'; 
@Module({

    imports: [
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Areas.name, schema: AreasSchema }], 'SERVER_FULL')
    ],
    controllers: [AreasController],
    providers: [AreasService],
    exports: [AreasService],
})
export class AreasModule { }
