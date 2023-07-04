import { Controller, Get, Headers } from '@nestjs/common'; 
import { AdslogsService } from './adslog.service'; 

@Controller('api/adsv2/logs')
export class AdslogsController {
    constructor(
        private readonly AdslogsService: AdslogsService) { }

    @Get()
    async getAdsSetting(@Headers() headers): Promise<any> {
        return await this.AdslogsService.getLog("NotificationAds");
    }
}
