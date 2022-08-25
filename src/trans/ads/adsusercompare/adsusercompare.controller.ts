import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, HttpCode, Query } from '@nestjs/common';
import { AdsUserCompareService } from './adsusercompare.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { CreateAdsDto } from '../dto/create-ads.dto';
import { AdsService } from '../ads.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { MediavideosadsService } from '../../../stream/mediavideosads/mediavideosads.service';

@Controller('api/ads')
export class AdsUserCompareController {

    constructor(
        private adsUserCompareService: AdsUserCompareService,
        private userAdsService: UserAdsService,
        private adsService: AdsService, 
        private userbasicsService: UserbasicsService,
        private utilsService: UtilsService,
        private mediavideosadsService: MediavideosadsService,
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
        // try {
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
                        "The process successfuly"
                    ]
                }
            };
        // }catch(e){
        //     await this.errorHandler.generateNotAcceptableException(
        //         'Unabled to proceed, ' + e,
        //     );
        // }
    }

    @UseGuards(JwtAuthGuard)
    @Get('/getads/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getads(@Headers() headers): Promise<any> {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (await this.utilsService.ceckData(data_userbasic)){
            var id_user = data_userbasic._id;
            var data_userads = await this.userAdsService.findOneByuserID(id_user.toString());
            if (await this.utilsService.ceckData(data_userads)) {
                for (var k = 0; k < data_userads.length;k++){
                    if(k==0){
                        var id_ads = data_userads[k].adsID;
                        var data_ads = await this.adsService.findOne(id_ads.toString());
                        if (await this.utilsService.ceckData(data_ads)) {
                            var limit_ads = data_ads.totalUsedCredit;
                            var data_userads_with_limit = await this.adsUserCompareService.getListUserAds(limit_ads);
                            var filteredArray = data_userads_with_limit.filter(function (itm) {
                                return itm.userID.toString() == id_user.toString();
                            });
                            var data_ads2 = await this.adsService.findOne(filteredArray[1].adsID.toString());
                            return {
                                "response_code": 202,
                                "data": data_ads2,
                                "messages": {
                                    "info": [
                                        "The process successfuly"
                                    ]
                                }
                            };
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed Ads not found'
                            );
                        }
                    }
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed User Ads not found'
                );
            }
        }else{
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }
    }

    @Get('/getads/stream/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getadsstream(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res({ passthrough: true }) response) {
        var data = await this.mediavideosadsService.findOne_(id);
        response.set("Content-Type", "video/mp4");
        response.send(data);
    }

}
