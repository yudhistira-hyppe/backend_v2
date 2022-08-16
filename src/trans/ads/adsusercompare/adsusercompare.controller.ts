import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, HttpCode } from '@nestjs/common';
import { AdsUserCompareService } from './adsusercompare.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { CreateAdsDto } from '../dto/create-ads.dto';
import { AdsService } from '../ads.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';

@Controller('api/ads')
export class AdsUserCompareController {

    constructor(
        private adsUserCompareService: AdsUserCompareService,
        private userAdsService: UserAdsService,
        private adsService: AdsService, 
        private userbasicsService: UserbasicsService,
        private utilsService: UtilsService,
        private errorHandler: ErrorHandler,) { }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/approve')
    async approve(@Body() CreateAdsDto_: CreateAdsDto, @Headers() headers) {
        var dataAds = null;
        var email = null;
        var dataUserBasic = null;
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }else{
            email = headers['x-auth-user'];
            dataUserBasic = await this.userbasicsService.findOne(email);
        }

        if (CreateAdsDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        } else {
            dataAds = await this.adsService.findOne(CreateAdsDto_._id.toString());
            if (!(await this.utilsService.ceckData(dataAds))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed ADS not found',
                );
            }
        }
        try{
            var _CreateAdsDto_ = new CreateAdsDto();
            _CreateAdsDto_.userIDAssesment = dataUserBasic._id;
            _CreateAdsDto_.status = 'APPROVE';
            _CreateAdsDto_.isActive = true;
            _CreateAdsDto_._id = dataAds._id;
            _CreateAdsDto_.userID = dataAds.userID;
            _CreateAdsDto_.liveAt = dataAds.liveAt;
            await this.adsUserCompareService.createUserAds(_CreateAdsDto_);
            return {
                "response_code": 202,
                "messages": {
                    "info": [
                        "The process successful"
                    ]
                }
            };
        }catch(e){
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e,
            );
        }
    }

}
