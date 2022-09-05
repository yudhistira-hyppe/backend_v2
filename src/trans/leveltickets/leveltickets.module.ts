import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LevelticketsController } from './leveltickets.controller';
import { LevelticketsService } from './leveltickets.service';
import { ConfigModule } from '@nestjs/config';
import { Leveltickets, LevelticketsSchema } from './schemas/leveltickets.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Leveltickets.name, schema: LevelticketsSchema }], 'SERVER_TRANS')
    ],
    controllers: [LevelticketsController],
    providers: [LevelticketsService],
    exports: [LevelticketsService],
})
export class LevelticketsModule { }
