import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'; 
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { AdsRewardsService } from './adsrewards.service';
import { AdsRewards } from './schema/adsrewards.schema';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';

@Controller('api/adsv2/reward/price')
export class AdsRewardsController {
    constructor(
        private readonly adsRewardsService: AdsRewardsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post("/create")
    async create(@Body() AdsRewards_: AdsRewards, @Headers() headers) {
        const Userbasic_: Userbasicnew = await this.utilsService.getIdUserByToken(headers);
        //Get current Time
        const currentDate = await this.utilsService.getDateTimeISOString()
        if (AdsRewards_.rewardPrice == undefined) {
            await this.errorHandler.generateBadRequestException("Unabled to proceed param creditPrice is required");
        }
        AdsRewards_._id = new mongoose.Types.ObjectId();
        AdsRewards_.iduser = new mongoose.Types.ObjectId(Userbasic_._id.toString());
        AdsRewards_.createAt = currentDate;
        AdsRewards_.updateAt = currentDate;
        AdsRewards_.status = true;
        const reminders = await this.adsRewardsService.create(AdsRewards_);

        return {
            "response_code": 202,
            "data": reminders,
            "messages": {
                "info": [
                    "Successfully"
                ]
            },
        };
    }
}
