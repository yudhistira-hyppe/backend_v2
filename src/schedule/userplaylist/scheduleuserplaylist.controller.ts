import { Controller, Post } from '@nestjs/common';
import { ScheduleUserPlaylistService } from './scheduleuserplaylist.service';
import { UtilsService } from '../../utils/utils.service';

@Controller('api/userplaylist')
export class ScheduleUserPlaylistController {
    constructor(
        private readonly scheduleUserPlaylistService: ScheduleUserPlaylistService,
        private readonly utilsService: UtilsService
        ) {}

    @Post('/start')
    async startTask() {
        var EngineUserPlaylistTimeEnd = String(await this.utilsService.getSetting("EngineUserPlaylistTimeEnd"));
        var convertToTime = String(await this.utilsService.convertToTime(EngineUserPlaylistTimeEnd));
        var EngineUserPlaylistIndex = Number(await this.utilsService.getSetting("EngineUserPlaylistIndex"));
        var EngineUserPlaylistDone = Boolean(await this.utilsService.getSetting("EngineUserPlaylistDone"));

        var dt = new Date(Date.now());
        dt = new Date(dt);

        var nowDateTime = dt.toISOString();
        var nowDate = nowDateTime.split('T')[0];
        var hms = convertToTime;
        var target = new Date(nowDate + 'T' + hms);

        console.log("date end",target);
        const result1 = target.getTime();
        console.log("time end", result1);

        console.log("date now", dt);
        const result2 = dt.getTime();
        console.log("time now", result2);
        
        // const loop_count= 30000;
        // for(let i=0;i<loop_count;i++){
        //     var now = new Date();
        //     var nowDateTime = now.toISOString();
        //     var nowDate = nowDateTime.split('T')[0];
        //     var hms = '01:12:33';
        //     var target = new Date(nowDate + 'T' + hms);
        //     console.log(target);
        // }
    }
}
