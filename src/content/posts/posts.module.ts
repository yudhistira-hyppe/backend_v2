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
@Module({

    imports: [
        GroupModuleModule,
        UtilsModule,
        ConfigModule.forRoot(), UserauthsModule, GetuserprofilesModule, UserbasicsModule, UtilsModule,InterestsModule,
        UserauthsModule,MediavideosModule,InsightsModule,ContenteventsModule,
        MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }], 'SERVER_CONTENT')
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule { }
