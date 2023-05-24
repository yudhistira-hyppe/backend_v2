import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsplacesController } from './adsplaces.controller';
import { AdsplacesService } from './adsplaces.service';
import { ConfigModule } from '@nestjs/config';
import { Adsplaces, AdsplacesSchema } from './schemas/adsplaces.schema';
import { AdstypesModule } from '../adstypes/adstypes.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        AdstypesModule,
        MongooseModule.forFeature([{ name: Adsplaces.name, schema: AdsplacesSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsplacesController],
    providers: [AdsplacesService],
    exports: [AdsplacesService],

})
export class AdsplacesModule { }
