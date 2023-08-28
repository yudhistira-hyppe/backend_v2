import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdstypesController } from './adstypes.controller';
import { AdstypesService } from './adstypes.service';
import { ConfigModule } from '@nestjs/config';
import { Adstypes, AdstypesSchema } from './schemas/adstypes.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module'; 

@Module({

    imports: [
        LogapisModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Adstypes.name, schema: AdstypesSchema }], 'SERVER_FULL')
    ],
    controllers: [AdstypesController],
    providers: [AdstypesService],
    exports: [AdstypesService],
})
export class AdstypesModule { }
