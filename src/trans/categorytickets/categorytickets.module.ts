import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryticketsController } from './categorytickets.controller';
import { CategoryticketsService } from './categorytickets.service';
import { ConfigModule } from '@nestjs/config';
import { Categorytickets, CategoryticketsSchema } from './schemas/categorytickets.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({

    imports: [
        ConfigModule.forRoot(), UtilsModule, LogapisModule,
        MongooseModule.forFeature([{ name: Categorytickets.name, schema: CategoryticketsSchema }], 'SERVER_FULL')
    ],
    controllers: [CategoryticketsController],
    providers: [CategoryticketsService],
    exports: [CategoryticketsService],
})
export class CategoryticketsModule { }
