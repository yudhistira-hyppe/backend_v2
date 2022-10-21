import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryticketsController } from './categorytickets.controller';
import { CategoryticketsService } from './categorytickets.service';
import { ConfigModule } from '@nestjs/config';
import { Categorytickets, CategoryticketsSchema } from './schemas/categorytickets.schema';

@Module({

    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Categorytickets.name, schema: CategoryticketsSchema }], 'SERVER_FULL')
    ],
    controllers: [CategoryticketsController],
    providers: [CategoryticketsService],
    exports: [CategoryticketsService],
})
export class CategoryticketsModule { }
