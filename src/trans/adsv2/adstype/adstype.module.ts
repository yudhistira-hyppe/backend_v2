import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdstypesController } from './adstype.controller';
import { AdstypeService } from './adstype.service';
import { ConfigModule } from '@nestjs/config';
import { Adstype, AdstypeSchema } from './schemas/adstype.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Adstype.name, schema: AdstypeSchema }], 'SERVER_FULL')
    ],
    controllers: [AdstypesController],
    providers: [AdstypeService],
    exports: [AdstypeService],
})
export class AdstypesModule { }
