import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, HttpCode, Query, NotFoundException } from '@nestjs/common';
import { AdsUserCompareService } from './adsusercompare.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { CreateAdsDto } from '../dto/create-ads.dto';
import { AdsService } from '../ads.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { MediavideosadsService } from '../../../stream/mediavideosads/mediavideosads.service';
import { AdstypesService } from '../../../trans/adstypes/adstypes.service';
import { CreateUserAdsDto } from '../../../trans/userads/dto/create-userads.dto';
import { AccountbalancesService } from '../../../trans/accountbalances/accountbalances.service';
import { CreateAccountbalancesDto } from '../../../trans/accountbalances/dto/create-accountbalances.dto';
import { AdsplacesService } from '../../../trans/adsplaces/adsplaces.service';

@Controller('api/ads')
export class AdsUserCompareController {

    constructor(
        private adsUserCompareService: AdsUserCompareService,
        private userAdsService: UserAdsService,
        private adsService: AdsService, 
        private userbasicsService: UserbasicsService,
        private utilsService: UtilsService,
        private mediavideosadsService: MediavideosadsService,
        private adstypesService: AdstypesService,
        private accountbalancesService: AccountbalancesService,
        private adsplacesService: AdsplacesService,
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
            var userbasicId = data_userbasic._id;
            var data_userads = await this.userAdsService.findOneByuserID(userbasicId.toString());
            if (await this.utilsService.ceckData(data_userads)) {
                var adsId = data_userads[0].adsID;
                var data_ads = await this.adsService.findOne(adsId.toString());
                if (await this.utilsService.ceckData(data_ads)) {
                    var data_response = {};
                    var media = await this.mediavideosadsService.findOne(data_ads.mediaAds.toString());
                    data_response['adsId'] = data_ads._id;
                    data_response['adsPlace'] = (await this.adsplacesService.findOne(data_ads.placingID.toString())).namePlace;
                    data_response['adsType'] = (await this.adstypesService.findOne(data_ads.typeAdsID.toString())).nameType;
                    data_response['adsSkip'] = await this.utilsService.getSetting("AdsPlay");
                    if (await this.utilsService.ceckData(media)) {
                        data_response['adsMedia'] = {
                            mediaBasePath: media.mediaBasePath,
                            mediaUri: media.mediaUri,
                            mediaType: media.mediaType,
                            mediaThumbEndpoint: media.mediaThumb,
                        }
                    }else{
                        data_response['adsMedia'] = null;
                    }
                    return {
                        "response_code": 202,
                        "data": data_response,
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
            } else {
                return {
                    "response_code": 202,
                    "data": null,
                    "messages": {
                        "info": [
                            "The process successfuly"
                        ]
                    }
                };
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
        var ads_data = await this.adsService.findOne(id);
        var ads_media = null;
        if (await this.utilsService.ceckData(ads_data)){
            ads_media = await this.mediavideosadsService.findOne(ads_data.mediaAds.toString());
        }
        if (ads_media != null) {
            var data = await this.mediavideosadsService.seaweedfsRead(ads_media.fsSourceUri);
            response.set("Content-Type", ads_media.mediaMime);
            response.send(data);

        } else {
            await this.errorHandler.generateNotFoundException(
                'Unabled to proceed File not found'
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/viewads/')
    @HttpCode(HttpStatus.ACCEPTED)
    async viewads(@Headers() headers, @Body() body): Promise<any> {
        if (await this.utilsService.validasiTokenEmail(headers)) {
            if (body.watchingTime == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime is reqired',
                );
            }
            if (body.adsId == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param adsId is reqired',
                );
            } 
            if (typeof body.watchingTime == 'number')  {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format',
                );
            }
            var user_email = headers['x-auth-user'];
            var watching_time = body.watchingTime;
            var ads_id = body.adsId;

            //Ceck UserbasicsService
            const data_userbasicsService = await this.userbasicsService.findOne(user_email);
            if (await this.utilsService.ceckData(data_userbasicsService)) {
                //Ceck adsService
                var data_adsService = await this.adsService.findOne(ads_id.toString());
                if (await this.utilsService.ceckData(data_adsService)) {
                    //Ceck mediavideosadsService
                    var data_mediavideosadsService = await this.mediavideosadsService.findOne(data_adsService.mediaAds.toString());
                    if (await this.utilsService.ceckData(data_mediavideosadsService)) {
                        var data_minimum_AdsPlay = await this.utilsService.getSetting("AdsPlay");
                        if (data_minimum_AdsPlay!=undefined){
                            if (watching_time==0) {
                                //Update ads
                                try {
                                    var CreateAdsDto_ = new CreateAdsDto();
                                    
                                    await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                                } catch (e) {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed, ' + e,
                                    );
                                }

                                //Update userads
                                try {
                                    var CreateUserAdsDto_ = new CreateUserAdsDto();

                                    await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);
                                } catch (e) {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed, ' + e,
                                    );
                                }

                                //Update accountbalace
                                try {
                                    var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();

                                    await this.accountbalancesService.create(CreateAccountbalancesDto_);
                                } catch (e) {
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed, ' + e,
                                    );
                                }
                            }else{
                                if (watching_time < data_minimum_AdsPlay) {
                                    //Update userads
                                    try {
                                        var CreateUserAdsDto_ = new CreateUserAdsDto();

                                        await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);
                                    } catch (e) {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed, ' + e,
                                        );
                                    }
                                } else {
                                    //Update ads
                                    try {
                                        var CreateAdsDto_ = new CreateAdsDto();

                                        await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                                    } catch (e) {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed, ' + e,
                                        );
                                    }
                                    
                                    //Update userads
                                    try {
                                        var CreateUserAdsDto_ = new CreateUserAdsDto();

                                        await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);

                                    } catch (e) {
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed, ' + e,
                                        );
                                    }
                                }
                            }
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed data setting AdsPlay not found',
                            );
                        }
                    }else{
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Ads media not found',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Ads not found',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed User not found',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
    }
}
