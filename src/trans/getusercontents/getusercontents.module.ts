import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetusercontentsController } from './getusercontents.controller';
import { GetusercontentsService } from './getusercontents.service';
import { ConfigModule } from '@nestjs/config';
import { Getusercontents, GetusercontentsSchema } from './schemas/getusercontents.schema';
import { MediaprofilepictsModule } from '../../content/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule } from '../../content/insights/insights.module';
import { PostsModule } from '../../content/posts/posts.module';
import { MediavideosModule } from '../../content/mediavideos/mediavideos.module';
import { MediapictsModule } from '../../content/mediapicts/mediapicts.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { MediadiariesModule } from '../../content/mediadiaries/mediadiaries.module';
import { DisquslogsModule } from '../../content/disquslogs/disquslogs.module';
import { DisqusModule } from '../../content/disqus/disqus.module';
import { CommentController } from './comment/comment.controller';
import { CommentService } from './comment/comment.service';
import { CommentModule } from './comment/comment.module';
import { GetcontenteventsController } from './getcontentevents/getcontentevents.controller';
import { GetcontenteventsModule } from './getcontentevents/getcontentevents.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { CountriesModule } from '../../infra/countries/countries.module';
import { SettingsModule } from '../settings/settings.module';
import { GetuserprofilesModule } from '../getuserprofiles/getuserprofiles.module';
import { ContenteventsModule } from '../../content/contentevents/contentevents.module';
import { TagCountModule } from '../../content/tag_count/tag_count.module';
import { InterestCountModule } from '../../content/interest_count/interest_count.module';
import { UtilsModule } from '../../utils/utils.module';
import { LogapisModule } from '../logapis/logapis.module';

@Module({

    imports: [
        ConfigModule.forRoot(), UserauthsModule, MediaprofilepictsModule, InsightsModule, PostsModule, MediavideosModule, MediapictsModule, MediadiariesModule, DisquslogsModule, DisqusModule, CommentModule, UserbasicsModule,
        GetcontenteventsModule, SettingsModule, CountriesModule, GetuserprofilesModule, ContenteventsModule, TagCountModule, InterestCountModule, LogapisModule,

        MongooseModule.forFeature([{ name: Getusercontents.name, schema: GetusercontentsSchema }], 'SERVER_FULL'),
        UtilsModule,




    ],
    controllers: [GetusercontentsController],
    exports: [GetusercontentsService],
    providers: [GetusercontentsService],
})
export class GetusercontentsModule { }
