import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SourceticketsController } from './sourcetickets.controller';
import { SourceticketsService } from './sourcetickets.service';
import { ConfigModule } from '@nestjs/config';
import { Sourcetickets, SourceticketsSchema } from './schemas/sourcetickets.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({

    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Sourcetickets.name, schema: SourceticketsSchema }], 'SERVER_FULL')
    ],
    controllers: [SourceticketsController],
    providers: [SourceticketsService],
    exports: [SourceticketsService],
})
export class SourceticketsModule { }
