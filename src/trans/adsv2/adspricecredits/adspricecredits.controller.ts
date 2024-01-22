import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'; 
import { AdsPriceCreditsService } from './adspricecredits.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdsPriceCredits } from './schema/adspricecredits.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import mongoose from 'mongoose';
import { Userbasic } from 'src/trans/userbasics/schemas/userbasic.schema';
import { Userbasicnew } from 'src/trans/userbasicnew/schemas/userbasicnew.schema';

@Controller('api/adsv2/credit/price')
export class AdsPriceCreditsController {
    constructor(
        private readonly adsPriceCreditsService: AdsPriceCreditsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post("/create")
    async create(@Body() AdsPriceCredits_: AdsPriceCredits, @Headers() headers) {
        const Userbasic_: Userbasicnew = await this.utilsService.getIdUserByToken(headers);
        //Get current Time
        const currentDate = await this.utilsService.getDateTimeISOString()
        if (AdsPriceCredits_.creditPrice == undefined) {
            await this.errorHandler.generateBadRequestException("Unabled to proceed param creditPrice is required");
        }
        AdsPriceCredits_._id = new mongoose.Types.ObjectId();
        AdsPriceCredits_.iduser = new mongoose.Types.ObjectId(Userbasic_._id.toString());
        AdsPriceCredits_.createAt = currentDate;
        AdsPriceCredits_.updateAt = currentDate;
        AdsPriceCredits_.status = true;
        const reminders = await this.adsPriceCreditsService.create(AdsPriceCredits_);

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
