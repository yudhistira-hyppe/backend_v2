import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NewPostService } from './new_post.service';
import { NewPostController } from './new_post.controller';
import { NewpostsSchema, newPosts } from './schemas/newPost.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { UserbasicnewModule } from 'src/trans/userbasicnew/userbasicnew.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { PostsModule } from '../posts/posts.module';
import { GetusercontentsModule } from 'src/trans/getusercontents/getusercontents.module';
import { MediamusicModule } from '../mediamusic/mediamusic.module';
import { SettingsModule } from 'src/trans/settings/settings.module';
import { MediastikerModule } from '../mediastiker/mediastiker.module';
import { NewPostContentService } from './new_postcontent.service';
import { InterestsModule } from 'src/infra/interests/interests.module';
import { TagCountModule } from '../tag_count/tag_count.module';
import { InsightsModule } from '../insights/insights.module';
import { MediavideosModule } from '../mediavideos/mediavideos.module';
import { MediastoriesModule } from '../mediastories/mediastories.module';
import { MediadiariesModule } from '../mediadiaries/mediadiaries.module';
import { MediapictsModule } from '../mediapicts/mediapicts.module';
import { TemplatesRepoModule } from 'src/infra/templates_repo/templates_repo.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MediastikerModule,
    UtilsModule,
    SettingsModule,
    ContenteventsModule,
    UserbasicnewModule,
    MediavideosModule,
    MediastoriesModule,
    MediadiariesModule,
    LogapisModule,
    InsightsModule,
    InterestsModule,
    TagCountModule,
    PostsModule,
    MediapictsModule,
    GetusercontentsModule,
    TemplatesRepoModule,
    DisquslogsModule,
    MediamusicModule,
    MongooseModule.forFeature([{ name: newPosts.name, schema: NewpostsSchema }], 'SERVER_FULL')
  ],
  controllers: [NewPostController],
  providers: [NewPostService, NewPostContentService],
  exports: [NewPostService, NewPostContentService]
})
export class NewPostModule { }
