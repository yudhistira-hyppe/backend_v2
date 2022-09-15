import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Userplaylist, UserplaylistSchema } from './schemas/userplaylist.schema';
import { UserplaylistController } from './userplaylist.controller';
import { UserplaylistService } from './userplaylist.service';
import { UtilsModule } from '../../utils/utils.module';
import { ContenteventsModule } from '../../content/contentevents/contentevents.module';
import { PostsModule } from '../../content/posts/posts.module';
import { MediadiariesModule } from '../../content/mediadiaries/mediadiaries.module';
import { MediastoriesModule } from '../../content/mediastories/mediastories.module';
import { MediavideosModule } from '../../content/mediavideos/mediavideos.module';
import { MediapictsModule } from '../../content/mediapicts/mediapicts.module';
import { UserbasicsModule } from '../userbasics/userbasics.module';

@Module({

    imports: [
        UserbasicsModule,
        MediapictsModule,
        MediavideosModule,
        MediastoriesModule,
        MediadiariesModule,
        PostsModule,
        ContenteventsModule,
        UtilsModule,
        ConfigModule.forRoot(),
        MongooseModule.forFeature([{ name: Userplaylist.name, schema: UserplaylistSchema }], 'SERVER_TRANS')
    ],
    controllers: [UserplaylistController],
    exports: [UserplaylistService],
    providers: [UserplaylistService],
})
export class UserplaylistModule {}