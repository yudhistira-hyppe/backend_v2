import { Controller, Post } from '@nestjs/common';
import { ScheduleUserPlaylistService } from './scheduleuserplaylist.service';

@Controller('api/userplaylist')
export class ScheduleUserPlaylistController {
    constructor(
        private readonly scheduleUserPlaylistService: ScheduleUserPlaylistService,
        ) {}

    @Post('/start')
    async startTask() {
        this.scheduleUserPlaylistService.runTask();
        return {
            response_code: 202,
            messages: {
                info: ['Task is running'],
            },
        };
    }
}
