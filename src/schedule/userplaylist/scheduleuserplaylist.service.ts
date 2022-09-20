import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { UtilsService } from '../../utils/utils.service';

@Injectable()
export class ScheduleUserPlaylistService {
    constructor(
        private utilsService: UtilsService,
    ) { }

    private readonly logger = new Logger(ScheduleUserPlaylistService.name);

    //@Interval(process.env.TIME_INTERVAL)
    @Cron(
        process.env.TIME_SECOND + ' ' + 
        process.env.TIME_MINUTES + ' ' + 
        process.env.TIME_HOURS + ' ' + 
        process.env.TIME_DAY_OF_MONTH + ' ' + 
        process.env.TIME_MONTHS + ' ' + 
        process.env.TIME_DAY_OF_WEEK, 
        {
            name: 'email',
            timeZone: process.env.TIMEZONE,
        }
    )

    async EmailRead() {
        
    }
}