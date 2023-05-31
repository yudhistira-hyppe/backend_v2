import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsPurposesController } from './adspurposes.controller';
import { AdsPurposesService } from './adspurposes.service';
import { ConfigModule } from '@nestjs/config';
import { AdsPurposes, AdsPurposesSchema } from './schema/adspurposes.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: AdsPurposes.name, schema: AdsPurposesSchema }], 'SERVER_FULL')
    ],
    controllers: [AdsPurposesController],
    providers: [AdsPurposesService],
    exports: [AdsPurposesService],
})
export class AdsPurposesModule { }
