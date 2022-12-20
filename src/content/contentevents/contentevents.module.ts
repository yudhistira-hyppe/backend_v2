import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContenteventsService } from './contentevents.service';
import { ContenteventsController } from './contentevents.controller';
import { ConfigModule } from '@nestjs/config';
import { Contentevents, ContenteventsSchema } from './schemas/contentevents.schema';
import { UtilsModule } from '../../utils/utils.module';
import { InsightsModule } from '../insights/insights.module';
import { PostDisqusModule } from '../disqus/post/postdisqus.module';
import { InsightlogsModule } from '../insightlogs/insightlogs.module';
import { UserAdsModule } from '../../trans/userads/userads.module';
import { DisquscontactsModule } from '../disquscontacts/disquscontacts.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { DisqusContentEventModule } from './discus/disqusdisquscontentevent.module';
import { DisqusContentEventController } from './discus/disquscontentevent.controller';
@Module({
    imports: [
        DisqusContentEventModule,
        DisquslogsModule,
        DisquscontactsModule,
        InsightlogsModule,
        PostDisqusModule,
        InsightsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Contentevents.name, schema: ContenteventsSchema }], 'SERVER_FULL')
    ],
    controllers: [ContenteventsController,],
    providers: [ContenteventsService, DisqusContentEventController],
    exports: [ContenteventsService],
})
export class ContenteventsModule { }
