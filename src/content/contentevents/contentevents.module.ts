import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContenteventsService } from './contentevents.service';
import { ContenteventsController } from './contentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentevents, ContenteventsSchema } from './schemas/contentevents.schema';
import { GroupModuleModule } from '../../trans/usermanagement/groupmodule/groupmodule.module'; 
import { UtilsModule } from '../../utils/utils.module';
import { InsightsModule } from '../insights/insights.module';
import { PostDisqusModule } from '../disqus/post/postdisqus.module';


@Module({
    imports: [
        PostDisqusModule,
        InsightsModule,
        UtilsModule,
        GroupModuleModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentevents.name, schema: ContenteventsSchema }],'SERVER_CONTENT')
    ],
    controllers: [ContenteventsController],
    providers: [ContenteventsService],
    exports: [ContenteventsService],
})
export class ContenteventsModule {}
