
import { Module } from '@nestjs/common';
import { ScheduleUserPlaylistController } from './scheduleuserplaylist.controller';
import { ScheduleUserPlaylistService } from './scheduleuserplaylist.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from '../../utils/utils.module';
import { PostsModule } from '../../content/posts/posts.module';
import { MediadiariesModule } from '../../content/mediadiaries/mediadiaries.module';
import { MediastoriesModule } from '../../content/mediastories/mediastories.module';
import { MediavideosModule } from '../../content/mediavideos/mediavideos.module';
import { MediapictsModule } from '../../content/mediapicts/mediapicts.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';
import { UserplaylistModule } from '../../trans/userplaylist/userplaylist.module';

@Module({
    imports: [
        UserplaylistModule,
        UserbasicsModule,
        MediapictsModule,
        MediavideosModule,
        MediastoriesModule,
        MediadiariesModule,
        PostsModule,
        UtilsModule,
        ScheduleModule.forRoot()
    ],
    controllers: [ScheduleUserPlaylistController],
    providers: [ScheduleUserPlaylistService]
})
export class ScheduleUserPlaylistModule {}