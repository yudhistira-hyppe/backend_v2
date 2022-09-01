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
import mongoose from 'mongoose';

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
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        const data_userads = await this.userAdsService.findOneByuserID(data_userbasic._id.toString());
        if (!(await this.utilsService.ceckData(data_userads))) {
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

        const data_ads = await this.adsService.findOne(data_userads[0].adsID.toString());
        if (!(await this.utilsService.ceckData(data_ads))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
            );
        }

        const data_media = await this.mediavideosadsService.findOne(data_ads.mediaAds.toString());
        if (!(await this.utilsService.ceckData(data_media))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads media not found'
            );
        }

        var data_response = {};
        data_response['adsId'] = data_ads._id;
        data_response['useradsId'] = data_userads[0]._id;
        data_response['adsPlace'] = (await this.adsplacesService.findOne(data_ads.placingID.toString())).namePlace;
        data_response['adsType'] = (await this.adstypesService.findOne(data_ads.typeAdsID.toString())).nameType;
        data_response['adsSkip'] = (await this.adstypesService.findOne(data_ads.typeAdsID.toString())).AdsSkip;
        let adsMedia = {}
        if (await this.utilsService.ceckData(data_media)) {
            if (data_media.mediaBasePath!=undefined){
                adsMedia['mediaBasePath'] = data_media.mediaBasePath;
            }
            if (data_media.mediaUri != undefined) {
                adsMedia['mediaUri'] = data_media.mediaUri;
            }
            if (data_media.mediaType != undefined) {
                adsMedia['mediaType'] = data_media.mediaType;
            }
            if (data_media.mediaThumb != undefined) {
                adsMedia['mediaThumbEndpoint'] = data_media.mediaThumb;
            }
            data_response['adsMedia'] = adsMedia;
        } else {
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

            var user_email = null;
            var watching_time = null;
            var ads_id = null;
            var userads_id = null;
            var current_date = await this.utilsService.getDateTimeString();

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
            if (typeof body.watchingTime != 'number')  {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
                );
            }
            if (body.watchingTime>0){
                if (body.useradsId == undefined) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed param body.watchingTime is reqired',
                    );
                }
            }

            user_email = headers['x-auth-user'];
            watching_time = body.watchingTime;
            ads_id = body.adsId;
            userads_id = body.useradsId;

            var rewards = false;

            const data_userbasicsService = await this.userbasicsService.findOne(user_email);
            if (!(await this.utilsService.ceckData(data_userbasicsService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed User not found',
                );
            }

            const data_adsService = await this.adsService.findOneActive(ads_id.toString());
            if (!(await this.utilsService.ceckData(data_adsService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Ads not found',
                );
            }

            var data_mediavideosadsService = await this.mediavideosadsService.findOne(data_adsService.mediaAds.toString());
            if (!(await this.utilsService.ceckData(data_mediavideosadsService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Ads media not found',
                );
            }

            var data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
            if (!(await this.utilsService.ceckData(data_adstypesService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Ads types not found',
                );
            }

            if (body.watchingTime == 0) {
                const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
                if (await this.utilsService.ceckData(data_userAdsService)) {
                    //Update userads
                    try {
                        var CreateUserAdsDto_ = new CreateUserAdsDto();
                        CreateUserAdsDto_.statusView = true;
                        CreateUserAdsDto_.viewed = 1;
                        await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);
                    } catch (e) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed, ' + e,
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed User Ads not found',
                    );
                }

                if (userAds_liveTypeuserads) {
                    //Insert userads
                    try {
                        var _CreateUserAdsDto_ = new CreateUserAdsDto();
                        _CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                        _CreateUserAdsDto_.adsID = data_userAdsService.adsID;
                        _CreateUserAdsDto_.clickAt = data_userAdsService.clickAt;
                        _CreateUserAdsDto_.createdAt = data_userAdsService.createdAt;
                        _CreateUserAdsDto_.description = data_userAdsService.description;
                        _CreateUserAdsDto_.priority = data_userAdsService.priority;
                        _CreateUserAdsDto_.priorityNumber = data_userAdsService.priorityNumber;
                        _CreateUserAdsDto_.statusClick = data_userAdsService.statusClick;
                        _CreateUserAdsDto_.statusView = data_userAdsService.statusView;
                        _CreateUserAdsDto_.updatedAt = data_userAdsService.updatedAt;
                        _CreateUserAdsDto_.liveTypeuserads = data_userAdsService.liveTypeuserads;
                        _CreateUserAdsDto_.userID = data_userAdsService.userID;
                        _CreateUserAdsDto_.viewAt = data_userAdsService.viewAt;
                        _CreateUserAdsDto_.viewed = 0;
                        _CreateUserAdsDto_.liveAt = data_userAdsService.liveAt.toString();
                        await this.userAdsService.create(_CreateUserAdsDto_);
                    } catch (e) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed, Insert userAds liveTypeuserads' + e,
                        );
                    }
                }

                return {
                    response_code: 202,
                    data: {
                        userAds_id: data_userAdsService ._id.toString() 
                    },
                    messages: {
                        info: ['successfully'],
                    },
                };
            } else {
                const data_userAdsService = await this.userAdsService.findOne(userads_id);
                if (await this.utilsService.ceckData(data_userAdsService)) {
                    if (data_adstypesService.AdsSkip == undefined) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Skip not found',
                        );
                    }
                    if (data_adstypesService.creditValue == undefined) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Credit not found',
                        );
                    }

                    var credit_view = data_adstypesService.creditValue;
                    var AdsSkip = data_adstypesService.AdsSkip;
                    var ads_rewards = data_adstypesService.rewards;
                    var userAds_liveTypeuserads = data_userAdsService.liveTypeuserads;

                    var ads_tayang = data_adsService.tayang;
                    var ads_totalView = 0;
                    if (data_adsService.totalView != undefined) {
                        ads_totalView = data_adsService.totalView;
                    }

                    var credit = data_adsService.creditValue;
                    var credit_free = data_adsService.creditFree;
                    var used_credit = data_adsService.usedCredit;
                    var used_credit_free = data_adsService.usedCreditFree;

                    if ((ads_totalView + 1) <= ads_tayang) {
                        const sisa_credit = credit - (used_credit + credit_view);
                        const sisa_credit_free = credit_free - (used_credit_free + credit_view);
                        let sisa_credit_view = 0;
                        if (sisa_credit == 0) {
                            if (sisa_credit_free >= credit_view) {
                                used_credit_free = used_credit_free + credit_view;
                            } 
                        } else if (sisa_credit > 0) {
                            if (watching_time > AdsSkip){
                                rewards = true;
                            }
                            if (sisa_credit < credit_view){
                                sisa_credit_view = credit_view - sisa_credit;
                                used_credit = used_credit + sisa_credit;
                                used_credit_free = used_credit_free + sisa_credit_view;
                            } else {
                                used_credit = used_credit + credit_view;
                            }
                        } else {
                            if (sisa_credit_free >= credit_view) {
                                used_credit_free = used_credit_free + credit_view;
                            }
                        }

                        if (watching_time > 0 && watching_time < AdsSkip) {
                            //Update userads
                            try {
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = true;
                                CreateUserAdsDto_.viewed = 1;
                                await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);
                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        } else if (watching_time > 0 && watching_time > AdsSkip) {
                            //Update userads
                            try {
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = true;
                                CreateUserAdsDto_.viewed = 1;
                                await this.userAdsService.updatesdataUserId(data_adsService._id.toString(), data_userbasicsService._id.toString(), CreateUserAdsDto_);

                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }

                            //Update ads
                            try {
                                var CreateAdsDto_ = new CreateAdsDto();
                                CreateAdsDto_.usedCredit = used_credit;
                                CreateAdsDto_.usedCreditFree = used_credit_free;
                                CreateAdsDto_.totalView = ads_totalView + 1;
                                await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        }

                        if (rewards) {
                            //Update accountbalace
                            try {
                                var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
                                CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
                                CreateAccountbalancesDto_.debet = 0;
                                CreateAccountbalancesDto_.kredit = ads_rewards;
                                CreateAccountbalancesDto_.type = "topup";
                                CreateAccountbalancesDto_.timestamp = current_date;
                                CreateAccountbalancesDto_.description = "rewards form ads";
                                await this.accountbalancesService.create(CreateAccountbalancesDto_);
                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        }

                        if (ads_tayang == (ads_totalView + 1)) {
                            //Update userads
                            try {
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = false;
                                await this.userAdsService.updatesdataAdsID(data_adsService._id.toString(), CreateUserAdsDto_);

                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }

                            //Update ads
                            try {
                                var CreateAdsDto_ = new CreateAdsDto();
                                CreateAdsDto_.usedCredit = used_credit;
                                CreateAdsDto_.usedCreditFree = used_credit_free;
                                CreateAdsDto_.totalView = ads_totalView + 1;
                                await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        }
                    }

                    return {
                        response_code: 202,
                        data:{
                            rewards: rewards,
                        },
                        messages: {
                            info: ['successfully'],
                        },
                    };
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed User Ads not found',
                    );
                }
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
    }
}
