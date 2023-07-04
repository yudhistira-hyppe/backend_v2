import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsObjectivitasController } from './adsobjectivitas.controller';
import { AdsObjectivitasService } from './adsobjectivitas.service';
import { ConfigModule } from '@nestjs/config';
import { AdsObjectivitas, AdsObjectivitasSchema } from './schema/adsobjectivitas.schema';
import { UtilsModule } from '../../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsObjectivitas.name, schema: AdsObjectivitasSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsObjectivitasController],
    providers: [AdsObjectivitasService],
    exports: [AdsObjectivitasService],
})
export class AdsObjectivitasModule { }
