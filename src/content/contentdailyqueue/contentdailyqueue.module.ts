import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentdailyqueueService } from './contentdailyqueue.service';
import { ContentdailyqueueController } from './contentdailyqueue.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentdailyqueues, ContentdailyqueuesSchema } from './schemas/contentdailyqueue.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentdailyqueues.name, schema: ContentdailyqueuesSchema }], 'SERVER_FULL')
    ],
    controllers: [ContentdailyqueueController],
    providers: [ContentdailyqueueService],
    exports: [ContentdailyqueueService],
})
export class ContentdailyqueueModule { }
