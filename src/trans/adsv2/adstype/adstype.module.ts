import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsTypesController } from './adstype.controller';
import { AdsTypeService } from './adstype.service';
import { ConfigModule } from '@nestjs/config';
import { AdsType, AdsTypeSchema } from './schemas/adstype.schema';
import { UtilsModule } from '../../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsType.name, schema: AdsTypeSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsTypesController],
    providers: [AdsTypeService],
    exports: [AdsTypeService],
})
export class AdsTypesModule { }
