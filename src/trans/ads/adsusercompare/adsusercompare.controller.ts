import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, HttpCode, Query, NotFoundException } from '@nestjs/common';
import { AdsUserCompareService } from './adsusercompare.service';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { CreateAdsDto } from '../dto/create-ads.dto';
import { AdsService } from '../ads.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { AdstypesService } from '../../../trans/adstypes/adstypes.service';
import { CreateUserAdsDto } from '../../../trans/userads/dto/create-userads.dto';
import { AccountbalancesService } from '../../../trans/accountbalances/accountbalances.service';
import { CreateAccountbalancesDto } from '../../../trans/accountbalances/dto/create-accountbalances.dto';
import { AdsplacesService } from '../../../trans/adsplaces/adsplaces.service';
import { UservouchersService } from '../../../trans/uservouchers/uservouchers.service';
import { VouchersService } from '../../../trans/vouchers/vouchers.service';
import { MediaprofilepictsService } from '../../../content/mediaprofilepicts/mediaprofilepicts.service';
//import { MediaimageadsService } from '../../../stream/mediaimageads/mediaimageads.service;
import mongoose from 'mongoose';
import { MongoServerClosedError } from 'mongodb';

@Controller('api/ads')
export class AdsUserCompareController {

    constructor(
        private adsUserCompareService: AdsUserCompareService,
        private userAdsService: UserAdsService,
        private adsService: AdsService,
        private userbasicsService: UserbasicsService,
        private utilsService: UtilsService,
        private adstypesService: AdstypesService,
        private accountbalancesService: AccountbalancesService,
        private adsplacesService: AdsplacesService,
        private readonly uservouchersService: UservouchersService,
        private readonly vouchersService: VouchersService,
        private mediaprofilepictsService: MediaprofilepictsService,
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
        } else {
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
            } else {
                if (dataAds.isActive && dataAds.status == 'APPROVE') {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, Ads status is live',
                    );
                }
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
    }

    @UseGuards(JwtAuthGuard)
    @Get('/getads/user/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getads(@Headers() headers,
        @Query('type') type: string): Promise<any> {
        let type_ = "";
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

        if (type != undefined) {
            type_ = type;
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Type Ads is required'
            );
        }

        const data_userads = await this.userAdsService.findOneByuserID(data_userbasic._id.toString(), type_);
        if (!(await this.utilsService.ceckData(data_userads))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User Ads Playlist not found'
            );
        }

        const data_ads = await this.adsService.findOne(data_userads[0].adsID.toString());
        if (!(await this.utilsService.ceckData(data_ads))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
            );
        }
        
        var get_profilePict = null;
        const data_userbasic_ads = await this.userbasicsService.findbyid(data_ads.userID.toString());
        if (data_userbasic_ads.profilePict != undefined) {
            if (data_userbasic_ads.profilePict != null) {
                var mediaprofilepicts_json = JSON.parse(JSON.stringify(data_userbasic_ads.profilePict));
                get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
            }
        }
        var data_response = {};
        data_response['adsId'] = data_ads._id.toString();
        data_response['adsUrlLink'] = data_ads.urlLink;
        data_response['adsDescription'] = data_ads.description;
        data_response['useradsId'] = data_userads[0]._id.toString();
        data_response['idUser'] = data_userbasic_ads._id.toString();
        data_response['fullName'] = data_userbasic_ads.fullName;
        data_response['email'] = data_userbasic_ads.email;
        data_response['avartar'] = {
            mediaBasePath: get_profilePict.mediaBasePath,
            mediaUri: get_profilePict.mediaUri,
            mediaType: get_profilePict.mediaType,
            mediaEndpoint: '/profilepict/' + get_profilePict.mediaUri.replace('_0001.jpeg', '')
        }
        var dataPlace = await this.adsplacesService.findOne(data_ads.placingID.toString());
        if (await this.utilsService.ceckData(dataPlace)) {
            data_response['adsPlace'] = dataPlace.namePlace;
        }
        data_response['adsType'] = (await this.adstypesService.findOne(data_ads.typeAdsID.toString())).nameType;
        data_response['adsSkip'] = (await this.adstypesService.findOne(data_ads.typeAdsID.toString())).AdsSkip;
        data_response['mediaType'] = data_ads.type;
        data_response['videoId'] = data_ads.idApsara;
        data_response['duration'] = data_ads.duration;

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
            if (typeof body.watchingTime != 'number') {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
                );
            }
            if (body.adsId == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param adsId is reqired',
                );
            }
            if (body.useradsId == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param useradsId is reqired',
                );
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

            const data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
            if (!(await this.utilsService.ceckData(data_adstypesService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Ads types not found',
                );
            }

            //const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
            const data_userAdsService = await this.userAdsService.findOnestatusView(userads_id.toString());
            if (!(await this.utilsService.ceckData(data_userAdsService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed User ads not found',
                );
            }

            var ads_rewards = 0;

            if (data_adstypesService.rewards != undefined) {
                ads_rewards = data_adstypesService.rewards;
            }

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

            if (body.watchingTime == 0) {
                //const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
                if (await this.utilsService.ceckData(data_userAdsService)) {
                    //Update userads
                    try {
                        var CreateUserAdsDto_ = new CreateUserAdsDto();
                        CreateUserAdsDto_.statusView = true;
                        CreateUserAdsDto_.clickAt = current_date;
                        CreateUserAdsDto_.viewed = 1;
                        CreateUserAdsDto_.timeViewSecond = watching_time;
                        await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
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

                // if (userAds_liveTypeuserads) {
                //     //Insert userads
                //     try {
                //         var _CreateUserAdsDto_ = new CreateUserAdsDto();
                //         _CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                //         _CreateUserAdsDto_.adsID = data_userAdsService.adsID;
                //         _CreateUserAdsDto_.clickAt = data_userAdsService.clickAt;
                //         _CreateUserAdsDto_.createdAt = current_date;
                //         _CreateUserAdsDto_.description = data_userAdsService.description;
                //         _CreateUserAdsDto_.priority = data_userAdsService.priority;
                //         _CreateUserAdsDto_.priorityNumber = data_userAdsService.priorityNumber;
                //         _CreateUserAdsDto_.statusClick = false;
                //         _CreateUserAdsDto_.statusView = false;
                //         _CreateUserAdsDto_.updatedAt = current_date;
                //         _CreateUserAdsDto_.liveTypeuserads = data_userAdsService.liveTypeuserads;
                //         _CreateUserAdsDto_.userID = data_userAdsService.userID;
                //         _CreateUserAdsDto_.viewAt = data_userAdsService.viewAt;
                //         _CreateUserAdsDto_.viewed = 0;
                //         _CreateUserAdsDto_.liveAt = data_userAdsService.liveAt.toString();
                //         _CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_userAdsService.adstypesId.toString());
                //         _CreateUserAdsDto_.nameType = data_userAdsService.nameType;
                //         _CreateUserAdsDto_.timeViewSecond = 0;
                //         await this.userAdsService.create(_CreateUserAdsDto_);
                //     } catch (e) {
                //         await this.errorHandler.generateNotAcceptableException(
                //             'Unabled to proceed, Insert userAds liveTypeuserads' + e,
                //         );
                //     }
                // }

                return {
                    response_code: 202,
                    data: {
                        userAds_id: data_userAdsService._id.toString()
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
                    var adsStatus = true;

                    if ((ads_totalView + 1) <= ads_tayang) {
                        const sisa_credit = credit - (used_credit + credit_view);
                        const sisa_credit_free = credit_free - (used_credit_free + credit_view);
                        let sisa_credit_view = 0;
                        if (sisa_credit == 0) {
                            if (sisa_credit_free >= credit_view) {
                                used_credit_free = used_credit_free + credit_view;
                            }
                        } else if (sisa_credit > 0) {
                            if (watching_time > AdsSkip) {
                                rewards = true;
                            }
                            if (sisa_credit < credit_view) {
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

                        if (ads_totalView == ads_tayang){
                            adsStatus = false;
                        }

                        if (watching_time > 0 && watching_time < AdsSkip) {
                            //Update userads
                            try {
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = true;
                                CreateUserAdsDto_.clickAt = current_date;
                                CreateUserAdsDto_.viewed = 1;
                                CreateUserAdsDto_.timeViewSecond = watching_time;
                                await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
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
                                CreateUserAdsDto_.clickAt = current_date;
                                CreateUserAdsDto_.viewed = 1;
                                CreateUserAdsDto_.timeViewSecond = watching_time;
                                await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);

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
                                CreateAdsDto_.isActive = adsStatus;
                                await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                            } catch (e) {
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        }

                        if (ads_totalView == ads_tayang) {
                            var CreateUserAdsDto_ = new CreateUserAdsDto();
                            CreateUserAdsDto_.isActive = adsStatus;
                            await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
                        }

                        // if (userAds_liveTypeuserads) {
                        //     //Insert userads
                        //     try {
                        //         var _CreateUserAdsDto_ = new CreateUserAdsDto();
                        //         _CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                        //         _CreateUserAdsDto_.adsID = data_userAdsService.adsID;
                        //         _CreateUserAdsDto_.clickAt = data_userAdsService.clickAt;
                        //         _CreateUserAdsDto_.createdAt = current_date;
                        //         _CreateUserAdsDto_.description = data_userAdsService.description;
                        //         _CreateUserAdsDto_.priority = data_userAdsService.priority;
                        //         _CreateUserAdsDto_.priorityNumber = data_userAdsService.priorityNumber;
                        //         _CreateUserAdsDto_.statusClick = false;
                        //         _CreateUserAdsDto_.statusView = false;
                        //         _CreateUserAdsDto_.updatedAt = current_date;
                        //         _CreateUserAdsDto_.liveTypeuserads = data_userAdsService.liveTypeuserads;
                        //         _CreateUserAdsDto_.userID = data_userAdsService.userID;
                        //         _CreateUserAdsDto_.viewAt = data_userAdsService.viewAt;
                        //         _CreateUserAdsDto_.viewed = 0;
                        //         _CreateUserAdsDto_.liveAt = data_userAdsService.liveAt.toString();
                        //         _CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_userAdsService.adstypesId.toString());
                        //         _CreateUserAdsDto_.nameType = data_userAdsService.nameType;
                        //         _CreateUserAdsDto_.timeViewSecond = 0;
                        //         await this.userAdsService.create(_CreateUserAdsDto_);
                        //     } catch (e) {
                        //         await this.errorHandler.generateNotAcceptableException(
                        //             'Unabled to proceed, Insert userAds liveTypeuserads' + e,
                        //         );
                        //     }
                        // }

                        if (rewards) {
                            //Update accountbalace
                            try {
                                var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
                                CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
                                CreateAccountbalancesDto_.debet = 0;
                                CreateAccountbalancesDto_.kredit = ads_rewards;
                                CreateAccountbalancesDto_.type = "rewards";
                                CreateAccountbalancesDto_.timestamp = current_date;
                                CreateAccountbalancesDto_.description = "rewards form ads view";
                                await this.accountbalancesService.create(CreateAccountbalancesDto_);
                            } catch (e) {
                                console.log('Unabled to proceed, ' + e);
                                // await this.errorHandler.generateNotAcceptableException(
                                //     'Unabled to proceed, ' + e,
                                // );
                            }

                            try{
                                var titleinsukses = "Reward";
                                var titleensukses = "Reward";
                                var bodyinsukses = "Selamat kamu mendapatkan reward Rp.400";
                                var bodyensukses = "Congratulation you've got a reward Rp.400";
                                var eventType = "ADS VIEW";
                                var event = "ADS VIEW";
                                await this.utilsService.sendFcm(data_userbasicsService.email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                            } catch (e) {
                                console.log('Unabled to proceed, ' + e);
                            }
                        }

                        // if (ads_tayang == (ads_totalView + 1)) {
                        //     //Update userads
                        //     try {
                        //         var CreateUserAdsDto_ = new CreateUserAdsDto();
                        //         CreateUserAdsDto_.statusView = false;
                        //         await this.userAdsService.updatesdataAdsID(data_adsService._id.toString(), CreateUserAdsDto_);

                        //     } catch (e) {
                        //         await this.errorHandler.generateNotAcceptableException(
                        //             'Unabled to proceed, ' + e,
                        //         );
                        //     }
                        // }
                    }else{
                        //Update userads
                        try {
                            var CreateUserAdsDto_ = new CreateUserAdsDto();
                            CreateUserAdsDto_.statusView = true;
                            CreateUserAdsDto_.clickAt = current_date;
                            CreateUserAdsDto_.viewed = 1;
                            CreateUserAdsDto_.timeViewSecond = watching_time;
                            await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
                        } catch (e) {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed, ' + e,
                            );
                        }
                    }

                    return {
                        response_code: 202,
                        data: {
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

    @UseGuards(JwtAuthGuard)
    @Post('/clickads/')
    @HttpCode(HttpStatus.ACCEPTED)
    async clickads(@Headers() headers, @Body() body): Promise<any> {
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
            if (typeof body.watchingTime != 'number') {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
                );
            }
            if (body.adsId == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param adsId is reqired',
                );
            }
            if (body.useradsId == undefined) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param body.watchingTime is reqired',
                );
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

            const data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
            if (!(await this.utilsService.ceckData(data_adstypesService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Ads types not found',
                );
            }

            //const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
            const data_userAdsService = await this.userAdsService.findOnestatusView(userads_id.toString());
            if (!(await this.utilsService.ceckData(data_userAdsService))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed User ads not found',
                );
            }

            var ads_rewards = 0;

            if (data_adstypesService.rewards != undefined) {
                ads_rewards = data_adstypesService.rewards;
            }

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
            var adsStatus = true;

            if ((ads_totalView + 1) <= ads_tayang) {
                const sisa_credit = credit - (used_credit + credit_view);
                const sisa_credit_free = credit_free - (used_credit_free + credit_view);
                let sisa_credit_view = 0;
                if (sisa_credit == 0) {
                    if (sisa_credit_free >= credit_view) {
                        used_credit_free = used_credit_free + credit_view;
                    }
                } else if (sisa_credit > 0) {
                    if (watching_time > AdsSkip) {
                        rewards = true;
                    }
                    if (sisa_credit < credit_view) {
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

                if (ads_totalView == ads_tayang) {
                    adsStatus = false;
                }

                //Update userads
                try {
                    var CreateUserAdsDto_ = new CreateUserAdsDto();
                    CreateUserAdsDto_.statusView = true;
                    CreateUserAdsDto_.statusClick = true;
                    CreateUserAdsDto_.clickAt = current_date;
                    CreateUserAdsDto_.viewed = 1; 
                    CreateUserAdsDto_.timeViewSecond = watching_time;
                    await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
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

                if (ads_totalView == ads_tayang) {
                    var CreateUserAdsDto_ = new CreateUserAdsDto();
                    CreateUserAdsDto_.isActive = adsStatus;
                    await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
                }

                // if (userAds_liveTypeuserads) {
                //     //Insert userads
                //     try {
                //         var _CreateUserAdsDto_ = new CreateUserAdsDto();
                //         _CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                //         _CreateUserAdsDto_.adsID = data_userAdsService.adsID;
                //         _CreateUserAdsDto_.clickAt = data_userAdsService.clickAt;
                //         _CreateUserAdsDto_.createdAt = current_date;
                //         _CreateUserAdsDto_.description = data_userAdsService.description;
                //         _CreateUserAdsDto_.priority = data_userAdsService.priority;
                //         _CreateUserAdsDto_.priorityNumber = data_userAdsService.priorityNumber;
                //         _CreateUserAdsDto_.statusClick = false;
                //         _CreateUserAdsDto_.statusView = false;
                //         _CreateUserAdsDto_.updatedAt = current_date;
                //         _CreateUserAdsDto_.liveTypeuserads = data_userAdsService.liveTypeuserads;
                //         _CreateUserAdsDto_.userID = data_userAdsService.userID;
                //         _CreateUserAdsDto_.viewAt = data_userAdsService.viewAt;
                //         _CreateUserAdsDto_.viewed = 0;
                //         _CreateUserAdsDto_.liveAt = data_userAdsService.liveAt.toString();
                //         _CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_userAdsService.adstypesId.toString());
                //         _CreateUserAdsDto_.nameType = data_userAdsService.nameType;
                //         _CreateUserAdsDto_.timeViewSecond = 0;
                //         await this.userAdsService.create(_CreateUserAdsDto_);
                //     } catch (e) {
                //         await this.errorHandler.generateNotAcceptableException(
                //             'Unabled to proceed, Insert userAds liveTypeuserads' + e,
                //         );
                //     }
                // }

                if (rewards) {
                    //Update accountbalace
                    try {
                        var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
                        CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
                        CreateAccountbalancesDto_.debet = 0;
                        CreateAccountbalancesDto_.kredit = ads_rewards;
                        CreateAccountbalancesDto_.type = "rewards";
                        CreateAccountbalancesDto_.timestamp = current_date;
                        CreateAccountbalancesDto_.description = "rewards form ads click";
                        await this.accountbalancesService.create(CreateAccountbalancesDto_);
                    } catch (e) {
                        console.log('Unabled to proceed, ' + e);
                    }


                    try {
                        var titleinsukses = "Reward";
                        var titleensukses = "Reward";
                        var bodyinsukses = "Selamat kamu mendapatkan reward Rp.400";
                        var bodyensukses = "Congratulation you've got a reward Rp.400";
                        var eventType = "ADS CLICK";
                        var event = "ADS CLICK";
                        await this.utilsService.sendFcm(data_userbasicsService.email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                    } catch (e) {
                        console.log('Unabled to proceed, ' + e);
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
                    // try {
                    //     var CreateAdsDto_ = new CreateAdsDto();
                    //     CreateAdsDto_.usedCredit = used_credit;
                    //     CreateAdsDto_.usedCreditFree = used_credit_free;
                    //     CreateAdsDto_.totalView = ads_totalView - 1;
                    //     await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                    // } catch (e) {
                    //     await this.errorHandler.generateNotAcceptableException(
                    //         'Unabled to proceed, ' + e,
                    //     );
                    // }
                }
            }

            return {
                response_code: 202,
                data: {
                    userAds_id: data_userAdsService._id.toString()
                },
                messages: {
                    info: ['successfully'],
                },
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update/')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() body): Promise<any> {
        if (body.adsId == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param adsId is reqired',
            );
        }
        if (body.tayang == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param tayang is reqired',
            );
        }
        if (body.userVoucherID == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param userVoucherID is reqired',
            );
        }

        var Ads_data = await this.adsService.findOne(body.adsId);
        if (await this.utilsService.ceckData(Ads_data)) {

            var creditTayang = Ads_data.totalUsedCredit / Ads_data.tayang;
            var totalTayang = Ads_data.tayang + body.tayang;
            var totalcreditTayang = creditTayang * totalTayang;

            var string_userVoucherID = body.userVoucherID.toString();
            var split_userVoucherID = string_userVoucherID.split(',');

            var arrayCreditvalue = [];
            var arrayFreeCredit = [];
            var arrayTotalCredit = [];
            var arrayUservoucher = [];

            var sumCreditValue = 0;
            var sumFreeCredit = 0;
            var sumCredittotal = 0;
            var totalCreditusvoucher = 0;

            for (var i = 0; i < split_userVoucherID.length; i++) {
                var _id_userVoucher = split_userVoucherID[i];

                var uservoucher_data = await this.uservouchersService.findOne(_id_userVoucher);
                var voucherid = uservoucher_data.voucherID;

                var voucher_data = await this.vouchersService.findOne(voucherid.toString());
                var valueCredit = voucher_data.creditValue;
                var freeCredit = voucher_data.creditPromo;
                var creditTotal = voucher_data.creditTotal;

                sumCreditValue += valueCredit;
                sumFreeCredit += freeCredit;
                sumCredittotal += creditTotal;

                // arrayCreditvalue.push(valueCredit);
                // arrayFreeCredit.push(freeCredit);
                // arrayTotalCredit.push(creditTotal);

                var objuservoucher = new mongoose.Types.ObjectId(_id_userVoucher);
                arrayUservoucher.push(objuservoucher);
                totalCreditusvoucher += uservoucher_data[i].totalCredit;
            }

            // for (var i = 0; i < split_userVoucherID.length; i++) {
            //     sumCreditValue += arrayCreditvalue[i];
            //     sumFreeCredit += arrayFreeCredit[i];
            //     sumCredittotal += arrayTotalCredit[i];
            // }

            var arrayUservoucher_existing = Ads_data.userVoucherID;
            arrayUservoucher = arrayUservoucher.concat(arrayUservoucher_existing);

            if (totalCreditusvoucher < totalcreditTayang) {
                await this.errorHandler.generateNotAcceptableException(
                    'Voucher credit is not sufficient, please buy a voucher first',
                );
            }

            var CreateAdsDto_ = new CreateAdsDto();
            CreateAdsDto_.tayang = totalTayang;
            CreateAdsDto_.totalUsedCredit = totalcreditTayang;
            CreateAdsDto_.userVoucherID = arrayUservoucher;
            CreateAdsDto_.creditValue = sumCreditValue + Ads_data.creditValue;
            CreateAdsDto_.creditFree = sumFreeCredit + Ads_data.creditFree;
            CreateAdsDto_.totalCredit = sumCredittotal + Ads_data.totalCredit;
            await this.adsService.update(Ads_data._id.toString(), CreateAdsDto_);
            CreateAdsDto_.userIDAssesment = Ads_data.userIDAssesment;
            CreateAdsDto_.status = 'APPROVE';
            CreateAdsDto_.isActive = true;
            CreateAdsDto_._id = {
                oid: Ads_data._id.toString(),
            };
            CreateAdsDto_.userID = Ads_data.userID;
            CreateAdsDto_.liveAt = Ads_data.liveAt;
            await this.adsUserCompareService.createUserAds(CreateAdsDto_);
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found',
            );
        }
    }
}
