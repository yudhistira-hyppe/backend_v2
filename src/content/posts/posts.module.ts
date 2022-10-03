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
@Module({

    imports: [
        BullModule.registerQueue({
            name: 'post-user-playlist',
        }),
        SeaweedfsModule,
        UserplaylistModule,
        GroupModuleModule,
        UtilsModule,
        ConfigModule.forRoot(), UserauthsModule, GetuserprofilesModule, UserbasicsModule, UtilsModule,InterestsModule,
        UserauthsModule,MediavideosModule,InsightsModule,ContenteventsModule,MediadiariesModule, MediastoriesModule,
        MediapictsModule,MediadiariesModule,MediaprofilepictsModule,PostPlayModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_CONTENT')
    ],
    controllers: [PostsController],
    providers: [PostsService, PostContentService],
    exports: [PostsService, PostContentService],
})
export class PostsModule { }
