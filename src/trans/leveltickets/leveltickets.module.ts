import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelticketsController } from './leveltickets.controller';
import { LevelticketsService } from './leveltickets.service';
import { ConfigModule } from '@nestjs/config';
import { Leveltickets, LevelticketsSchema } from './schemas/leveltickets.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module'; 

@Module({

    imports: [
        UtilsModule,
        LogapisModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Leveltickets.name, schema: LevelticketsSchema }], 'SERVER_FULL')
    ],
    controllers: [LevelticketsController],
    providers: [LevelticketsService],
    exports: [LevelticketsService],
})
export class LevelticketsModule { }
