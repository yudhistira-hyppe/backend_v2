import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Posts, PostsSchema } from './schemas/posts.schema';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
import { GetuserprofilesModule } from '../../trans/getuserprofiles/getuserprofiles.module';
import { UtilsModule } from '../../utils/utils.module';
import { GroupModuleModule } from '../../trans/usermanagement/groupmodule/groupmodule.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { InterestsModule } from '../../infra/interests/interests.module';
import { MediavideosModule } from '../mediavideos/mediavideos.module';
import { InsightsModule } from '../insights/insights.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { PostContentService } from './postcontent.service';
import { MediadiariesModule } from '../mediadiaries/mediadiaries.module';
import { MediastoriesModule } from '../mediastories/mediastories.module';
import { MediapictsModule } from '../mediapicts/mediapicts.module';
import { MediaprofilepictsModule } from '../mediaprofilepicts/mediaprofilepicts.module';
import { UserplaylistModule } from '../../trans/userplaylist/userplaylist.module';
import { PostPlayModule } from '../postplaylist/postplaylist.module';
import { SeaweedfsModule } from '../../stream/seaweedfs/seaweedfs.module';
import { BullModule } from '@nestjs/bull';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PostContentPlaylistService } from './postcontentplaylist.service';
import { TemplatesRepoModule } from '../../infra/templates_repo/templates_repo.module';
import { PostCommentService } from './postcomment.service';
import { DisqusModule } from '../disqus/disqus.module';
import { DisquslogsModule } from '../disquslogs/disquslogs.module';
import { SettingsModule } from '../../trans/settings/settings.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { InsightlogsModule } from '../insightlogs/insightlogs.module';
import { ContentModService } from './contentmod.service';
import { OyPgModule } from '../../paymentgateway/oypg/oypg.module';
import { MethodepaymentsModule } from '../../trans/methodepayments/methodepayments.module';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { SocketModule } from '../socket/socket.module';
import { PostBoostService } from './postboost.service';
import { MediamusicModule } from '../mediamusic/mediamusic.module';
@Module({

    imports: [
        MediamusicModule,
        MethodepaymentsModule,
        OyPgModule,
        BullModule.registerQueue({
            name: 'post-user-playlist',
        }),
        NestjsFormDataModule,
        SeaweedfsModule,
        UserplaylistModule,
        GroupModuleModule,
        UtilsModule,
        ConfigModule.forRoot(), UserauthsModule, GetuserprofilesModule, UserbasicsModule, UtilsModule,InterestsModule,
        UserauthsModule,MediavideosModule,InsightsModule,ContenteventsModule,MediadiariesModule, MediastoriesModule,
        MediapictsModule,MediadiariesModule,MediaprofilepictsModule,PostPlayModule,TemplatesRepoModule,DisqusModule
        ,DisquslogsModule,SettingsModule,NotificationsModule,InsightlogsModule,SocketModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_FULL')
    ],
    controllers: [PostsController],
    providers: [PostsService, PostContentService, PostContentPlaylistService, PostCommentService, ContentModService, PostBoostService],
    exports: [PostsService, PostContentService, PostContentPlaylistService, PostCommentService, ContentModService, PostBoostService],
})
export class PostsModule { }
