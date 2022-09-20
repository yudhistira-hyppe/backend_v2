
import { Module } from '@nestjs/common';
import { ScheduleUserPlaylistController } from './scheduleuserplaylist.controller';
import { ScheduleUserPlaylistService } from './scheduleuserplaylist.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from '../../utils/utils.module';

@Module({
    imports: [
        UtilsModule,
        ScheduleModule.forRoot()
    ],
    controllers: [ScheduleUserPlaylistController],
    providers: [ScheduleUserPlaylistService]
})
export class ScheduleUserPlaylistModule {}