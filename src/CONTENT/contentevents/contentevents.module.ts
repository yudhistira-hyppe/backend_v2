import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContenteventsService } from './contentevents.service';
import { ContenteventsController } from './contentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentevents, ContenteventsSchema } from './schemas/contentevents.schema';

@Module({
    imports: [
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentevents.name, schema: ContenteventsSchema }],'SERVER_CONTENT')
    ],
    controllers: [ContenteventsController],
    providers: [ContenteventsService],
    exports: [ContenteventsService],
})
export class ContenteventsModule {}
