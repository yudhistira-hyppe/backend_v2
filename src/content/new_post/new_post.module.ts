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
@Module({
  imports: [
    ConfigModule.forRoot(),
    MediastikerModule,
    UtilsModule,
    SettingsModule,
    ContenteventsModule,
    UserbasicnewModule,
    LogapisModule,
    PostsModule,
    GetusercontentsModule,
    DisquslogsModule,
    MediamusicModule,
    MongooseModule.forFeature([{ name: newPosts.name, schema: NewpostsSchema }], 'SERVER_FULL')
  ],
  controllers: [NewPostController],
  providers: [NewPostService, NewPostContentService],
  exports: [NewPostService, NewPostContentService]
})
export class NewPostModule { }
