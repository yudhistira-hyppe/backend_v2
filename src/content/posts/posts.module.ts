import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { ConfigModule } from '@nestjs/config';
import { Posts, PostsSchema } from './schemas/posts.schema';
import { UserauthsModule } from '../../trans/userauths/userauths.module';
import { GetuserprofilesModule } from '../../trans/getuserprofiles/getuserprofiles.module';
import { UtilsModule } from '../../utils/utils.module';
import { GroupModuleModule } from '../../trans/usermanagement/groupmodule/groupmodule.module';
import { UserbasicsModule } from 'src/trans/userbasics/userbasics.module';
import { InterestsModule } from 'src/infra/interests/interests.module';
import { MediavideosModule } from '../mediavideos/mediavideos.module';
import { InsightsModule } from '../insights/insights.module';
import { ContenteventsModule } from '../contentevents/contentevents.module';
import { PostContentService } from './postcontent.service';
import { MediadiariesModule } from '../mediadiaries/mediadiaries.module';
import { MediastoriesModule } from '../mediastories/mediastories.module';
import { MediapictsModule } from '../mediapicts/mediapicts.module';
@Module({

    imports: [
        GroupModuleModule,
        UtilsModule,
        ConfigModule.forRoot(), UserauthsModule, GetuserprofilesModule, UserbasicsModule, UtilsModule,InterestsModule,
        UserauthsModule,MediavideosModule,InsightsModule,ContenteventsModule,MediadiariesModule, MediastoriesModule,
        MediapictsModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_CONTENT')
    ],
    controllers: [PostsController],
    providers: [PostsService, PostContentService],
    exports: [PostsService, PostContentService],
})
export class PostsModule { }
