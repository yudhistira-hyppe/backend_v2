import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, HttpCode, Query, NotFoundException, Logger } from '@nestjs/common';
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
import { Mutex, MutexInterface, Semaphore, SemaphoreInterface, withTimeout } from 'async-mutex';
import { ObjectId } from 'mongodb';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('api/ads')
export class AdsUserCompareController {
    private readonly logger = new Logger(AdsUserCompareController.name);
    private locks: Map<string, MutexInterface>;
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
        private errorHandler: ErrorHandler,
        private readonly logapiSS: LogapisService) {
        this.locks = new Map();
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/approve')
    async approve(@Body() CreateAdsDto_: CreateAdsDto, @Headers() headers, @Request() request) {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_start = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(CreateAdsDto_));
        
        var dataAds = null;
        var email = null;
        var dataUserBasic = null;

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);
            
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        } else {
            email = headers['x-auth-user'];
            dataUserBasic = await this.userbasicsService.findOne(email);
        }

        if (CreateAdsDto_._id == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param _id is required',
            );
        } else {
            dataAds = await this.adsService.findOne(CreateAdsDto_._id.toString());
            if (!(await this.utilsService.ceckData(dataAds))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed ADS not found',
                );
            } else {
                if (dataAds.isActive && dataAds.status == 'APPROVE') {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, Ads status is live',
                    );
                }
            }
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        // try {
        var _CreateAdsDto_ = new CreateAdsDto();
        _CreateAdsDto_.userIDAssesment = dataUserBasic._id;
        _CreateAdsDto_.status = 'APPROVE';
        _CreateAdsDto_.isActive = true;
        _CreateAdsDto_._id = dataAds._id;
        _CreateAdsDto_.userID = dataAds.userID;
        _CreateAdsDto_.liveAt = dataAds.liveAt;
        _CreateAdsDto_.updatedAt = dt.toISOString();
        await this.adsService.update(dataAds._id, _CreateAdsDto_);
        //this.adsUserCompareService.createUserAds(_CreateAdsDto_);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

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
    @Get('/getads/user/v2/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getads(@Headers() headers,
        @Query('type') type: string): Promise<any> {
        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START type : " + type);
        let type_ = "";
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed token and email not match");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        if (type != undefined) {
            type_ = type;
        } else {
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Type Ads is required");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Type Ads is required'
            );
        }

        var getDate = await this.utilsService.getDateString();
        const data_userads = await this.userAdsService.findOneByuserID(data_userbasic._id.toString(), type_, getDate);
        if (!(await this.utilsService.ceckData(data_userads))) {
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads Playlist not found");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User Ads Playlist not found'
            );
        }

        const data_ads = await this.adsService.findOne(data_userads[0].adsID.toString());
        if (!(await this.utilsService.ceckData(data_ads))) {
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads Playlist not found");
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

        // data_response['avartar'].mediaBasePath = (get_profilePict.mediaBasePath != undefined) ? get_profilePict.mediaBasePath : null;
        // data_response['avartar'].mediaUri = (get_profilePict.mediaUri != undefined) ? get_profilePict.mediaUri : null;
        // data_response['avartar'].mediaType = (get_profilePict.mediaType != undefined) ? get_profilePict.mediaType : null;
        // data_response['avartar'].mediaEndpoint = (get_profilePict.mediaEndpoint != undefined) ? get_profilePict.mediaEndpoint : null;

        if (await this.utilsService.ceckData(get_profilePict)) {
            data_response['avartar'] = {
                mediaBasePath: (get_profilePict.mediaBasePath != undefined) ? get_profilePict.mediaBasePath : null,
                mediaUri: (get_profilePict.mediaUri != undefined) ? get_profilePict.mediaUri : null,
                mediaType: (get_profilePict.mediaType != undefined) ? get_profilePict.mediaType : null,
                mediaEndpoint: (get_profilePict.mediaID != undefined) ? '/profilepict/' + get_profilePict.mediaID : null,
            }
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
        this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, The process successfuly : " + JSON.stringify(data_response));

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

    @UseGuards(JwtAuthGuard)
    @Get('/getads/user/')
    @HttpCode(HttpStatus.ACCEPTED)
    async getadsv2(@Headers() headers,
        @Query('type') type: string, @Request() request): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_start = await this.utilsService.getDateTimeString();

        this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
        this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START type : " + type);
        let type_ = "";
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed token and email not match");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
        const data_userbasic = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
            
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        if (type != undefined) {
            type_ = type;
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Type Ads is required");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Type Ads is required'
            );
        }

        var current_date = await this.utilsService.getDateTimeString();
        //const data_ads = await this.adsService.findAds(headers['x-auth-user'], type_);
        //const data_ads = await this.adsService.findAdsNew(headers['x-auth-user'], data_userbasic._id.toString(), type_);
        const data_ads = await this.adsService.findAds(headers['x-auth-user'], data_userbasic._id.toString(), type_);
        console.log(data_ads);
        var genIdUserAds = new mongoose.Types.ObjectId();
        if (await this.utilsService.ceckData(data_ads)) {
            var ceckData = await this.userAdsService.findAdsIDUserID(data_ads[0].userID.toString(), data_ads[0].adsId.toString());
            if (!(await this.utilsService.ceckData(ceckData))) {
                var CreateUserAdsDto_ = new CreateUserAdsDto();
                try {
                    CreateUserAdsDto_._id = genIdUserAds;
                    CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(data_ads[0].adsId);
                    CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(data_ads[0].userID);
                    CreateUserAdsDto_.priority = data_ads[0].priority;
                    CreateUserAdsDto_.priorityNumber = data_ads[0].priorityNumber;
                    if (data_ads[0].description != undefined) {
                        CreateUserAdsDto_.description = data_ads[0].description;
                    }
                    CreateUserAdsDto_.createdAt = current_date;
                    CreateUserAdsDto_.statusClick = false;
                    CreateUserAdsDto_.statusView = false;
                    CreateUserAdsDto_.viewed = 0;
                    CreateUserAdsDto_.liveAt = data_ads[0].liveAt;
                    CreateUserAdsDto_.liveTypeuserads = data_ads[0].liveTypeAds;
                    CreateUserAdsDto_.adstypesId = new mongoose.Types.ObjectId(data_ads[0].typeAdsID);
                    CreateUserAdsDto_.nameType = data_ads[0].adsType;
                    CreateUserAdsDto_.isActive = true;
                    const createUserAdsDto = await this.userAdsService.create(CreateUserAdsDto_);
                } catch (s) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Failed update Ads',
                    );
                }
            }

            var get_profilePict = null;
            const data_userbasic_ads = await this.userbasicsService.findbyid(data_ads[0].adsUserId.toString());
            if (data_userbasic_ads.profilePict != undefined) {
                if (data_userbasic_ads.profilePict != null) {
                    var mediaprofilepicts_json = JSON.parse(JSON.stringify(data_userbasic_ads.profilePict));
                    get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
                }
            }
            var data_response = {};
            data_response['adsId'] = data_ads[0].adsId.toString();
            data_response['adsUrlLink'] = data_ads[0].urlLink;
            data_response['adsDescription'] = data_ads[0].description;
            if (await this.utilsService.ceckData(ceckData)) {
                data_response['useradsId'] = ceckData._id.toString();
            } else {
                data_response['useradsId'] = genIdUserAds.toString();
            }
            data_response['idUser'] = data_userbasic_ads._id.toString();
            data_response['fullName'] = data_userbasic_ads.fullName;
            data_response['email'] = data_userbasic_ads.email;

            if (await this.utilsService.ceckData(get_profilePict)) {
                data_response['avartar'] = {
                    mediaBasePath: (get_profilePict.mediaBasePath != undefined) ? get_profilePict.mediaBasePath : null,
                    mediaUri: (get_profilePict.mediaUri != undefined) ? get_profilePict.mediaUri : null,
                    mediaType: (get_profilePict.mediaType != undefined) ? get_profilePict.mediaType : null,
                    mediaEndpoint: (get_profilePict.mediaID != undefined) ? '/profilepict/' + get_profilePict.mediaID : null,
                }
            }

            var dataPlace = await this.adsplacesService.findOne(data_ads[0].placingID.toString());
            if (await this.utilsService.ceckData(dataPlace)) {
                data_response['adsPlace'] = dataPlace.namePlace;
            }
            console.log("skipTime", data_ads[0].skipTime);
            data_response['adsType'] = (await this.adstypesService.findOne(data_ads[0].typeAdsID.toString())).nameType;
            data_response['adsSkip'] = (data_ads[0].skipTime != undefined) ? data_ads[0].skipTime : (await this.adstypesService.findOne(data_ads[0].typeAdsID.toString())).AdsSkip;
            data_response['mediaType'] = data_ads[0].type;
            data_response['videoId'] = data_ads[0].idApsara;
            data_response['duration'] = data_ads[0].duration;
            this.logger.log("GET ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, The process successfuly : " + JSON.stringify(data_response));

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found'
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
    }

    @UseGuards(JwtAuthGuard)
    @Post('/viewads/')
    @HttpCode(HttpStatus.ACCEPTED)
    async viewads(@Headers() headers, @Body() body, @Request() request): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_start = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(body));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START body : " + JSON.stringify(body));
        if (await this.utilsService.validasiTokenEmail(headers)) {
            var user_email = null;
            var watching_time = null;
            var ads_id = null;
            var userads_id = null;
            var current_date = await this.utilsService.getDateTimeString();

            if (body.watchingTime == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime is reqired',
                );
            }
            if (typeof body.watchingTime != 'number') {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime invalid format " + typeof body.watchingTime);
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
                );
            }
            if (body.adsId == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param adsId is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param adsId is reqired',
                );
            }
            if (body.useradsId == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param useradsId is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param useradsId is reqired',
                );
            }

            user_email = headers['x-auth-user'];
            watching_time = body.watchingTime;
            ads_id = body.adsId;
            userads_id = body.useradsId;
            var rewards = false;

            if (!this.locks.has(user_email)) {
                this.locks.set(user_email, new Mutex());
            }

            return this.locks.get(user_email).acquire().then(async (release) => {
                try {
                    const data_userbasicsService = await this.userbasicsService.findOne(user_email);
                    if (!(await this.utilsService.ceckData(data_userbasicsService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed User not found',
                        );
                    }

                    const data_adsService = await this.adsService.findOneActive(ads_id.toString());
                    if (!(await this.utilsService.ceckData(data_adsService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Ads not found',
                        );
                    }

                    const data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
                    if (!(await this.utilsService.ceckData(data_adstypesService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);
                        
                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads types not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Ads types not found',
                        );
                    }

                    const data_userAdsService = await this.userAdsService.getAdsUser(userads_id.toString());
                    if (data_adstypesService.AdsSkip == undefined) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Skip not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Skip not found',
                        );
                    }

                    if (data_adstypesService.creditValue == undefined) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Credit not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Credit not found',
                        );
                    }

                    if (body.watchingTime == 0) {
                        //const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
                        if (await this.utilsService.ceckData(data_userAdsService)) {
                            //Update userads
                            try {
                                var userAds_viewedUnder = (data_userAdsService.viewedUnder != undefined) ? data_userAdsService.viewedUnder : 0;
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = true;
                                CreateUserAdsDto_.clickAt = current_date;
                                CreateUserAdsDto_.viewedUnder = userAds_viewedUnder+1;
                                CreateUserAdsDto_.timeViewSecond = watching_time;
                                await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
                            } catch (e) {
                                var timestamps_end = await this.utilsService.getDateTimeString();
                                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);
                                
                                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                            this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed User Ads not found',
                            );
                        }

                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, successfully " + JSON.stringify(body));
                        return {
                            response_code: 202,
                            data: {
                                userAds_id: data_userAdsService._id.toString()
                            },
                            messages: {
                                info: ['successfully'],
                            },
                        };
                    }else if (body.watchingTime > 0 && body.watchingTime < AdsSkip) {
                        //const data_userAdsService = await this.userAdsService.findOneByuserIDAds(data_userbasicsService._id.toString(), ads_id.toString());
                        if (await this.utilsService.ceckData(data_userAdsService)) {
                            //Update userads
                            try {
                                var userAds_viewedUnder = (data_userAdsService.viewedUnder != undefined) ? data_userAdsService.viewedUnder : 0;
                                var CreateUserAdsDto_ = new CreateUserAdsDto();
                                CreateUserAdsDto_.statusView = true;
                                CreateUserAdsDto_.clickAt = current_date;
                                CreateUserAdsDto_.viewedUnder = userAds_viewedUnder+1;
                                CreateUserAdsDto_.timeViewSecond = watching_time;
                                await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
                            } catch (e) {
                                var timestamps_end = await this.utilsService.getDateTimeString();
                                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                await this.errorHandler.generateNotAcceptableException(
                                    'Unabled to proceed, ' + e,
                                );
                            }
                        } else {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                            this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed User Ads not found',
                            );
                        }

                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, successfully " + JSON.stringify(body));
                        return {
                            response_code: 202,
                            data: {
                                userAds_id: data_userAdsService._id.toString()
                            },
                            messages: {
                                info: ['successfully'],
                            },
                        };
                    }else {
                        if (await this.utilsService.ceckData(data_userAdsService)) {
                            var credit_view = data_adstypesService.creditValue;
                            var AdsSkip = data_adstypesService.AdsSkip;
                            var ads_rewards = data_adstypesService.rewards;

                            var userAds_liveTypeuserads = (data_userAdsService.liveTypeuserads != undefined) ? data_userAdsService.liveTypeuserads : false;
                            var userAds_statusView = (data_userAdsService.statusView != undefined) ? data_userAdsService.statusView : false;
                            var userAds_statusClick = (data_userAdsService.statusClick != undefined) ? data_userAdsService.statusClick : false;
                            var userAds_timeViewSecond = (data_userAdsService.timeViewSecond != undefined) ? data_userAdsService.timeViewSecond : null;
                            var userAds_viewed = (data_userAdsService.viewed != undefined) ? data_userAdsService.viewed : 0;

                            var userID = (data_userAdsService.userID != undefined) ? data_userAdsService.userID.toString() : null;
                            var adsID = (data_userAdsService.adsID != undefined) ? data_userAdsService.adsID.toString() : null;

                            var ads_tayang = data_adsService.tayang;
                            var ads_totalView = 0;
                            if (data_adsService.totalView != undefined) {
                                ads_totalView = data_adsService.totalView;
                            }

                            var credit = data_adsService.creditValue;
                            var credit_free = data_adsService.creditFree;
                            var used_credit = data_adsService.usedCredit;
                            var used_credit_free = data_adsService.usedCreditFree;

                            //GetSaldo
                            let Saldo = 0;
                            var GetSaldo = await this.accountbalancesService.findwallettotalsaldo(data_userbasicsService._id);
                            if (await this.utilsService.ceckData(GetSaldo)){
                                if (GetSaldo.length>0){
                                    Saldo += GetSaldo[0].totalsaldo;
                                }
                            }

                            if ((ads_totalView + 1) <= ads_tayang) {
                                const sisa_credit = credit - (used_credit + credit_view);
                                const sisa_credit_free = credit_free - (used_credit_free + credit_view);
                                let sisa_credit_view = 0;
                                if (sisa_credit == 0) {
                                    used_credit = used_credit + credit_view;
                                }else if (sisa_credit > 0) {
                                    if (watching_time > (AdsSkip-1)) {
                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, AdsSkip : " + AdsSkip.toString());
                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, watching_time : " + watching_time.toString());
                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, rewards : " + rewards.toString());
                                        if (userAds_liveTypeuserads) {
                                            if ((userID != null) && (adsID != null)) {
                                                const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
                                                if (await this.utilsService.ceckData(ceck_rewars)) {
                                                    rewards = false;
                                                } else {
                                                    rewards = true;
                                                    // if (Saldo < 49000) {
                                                    //     rewards = true;
                                                    // } else {
                                                    //     rewards = false;
                                                    // }
                                                }
                                            }
                                        } else {
                                            if ((userID != null) && (adsID != null)) {
                                                const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
                                                if (await this.utilsService.ceckData(ceck_rewars)) {
                                                    rewards = false;
                                                } else {
                                                    rewards = true;
                                                    // if (Saldo < 49000) {
                                                    //     rewards = true;
                                                    // } else {
                                                    //     rewards = false;
                                                    // }
                                                }
                                            }
                                            //rewards = true;
                                        }
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

                                //Update userads
                                try {
                                    var CreateUserAdsDto_ = new CreateUserAdsDto();
                                    CreateUserAdsDto_.statusView = true;
                                    CreateUserAdsDto_.clickAt = current_date;
                                    if (userAds_liveTypeuserads) {
                                        var viewedAds = Number(userAds_viewed) + 1;
                                        CreateUserAdsDto_.viewed = viewedAds;
                                        CreateUserAdsDto_.viewedUnder = 0;
                                    } else {
                                        CreateUserAdsDto_.viewed = 1;
                                        CreateUserAdsDto_.viewedUnder = 0;
                                    }
                                    CreateUserAdsDto_.timeViewSecond = watching_time;
                                    await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
                                    this.userAdsService.updateUpdateAt(data_userAdsService._id.toString(), current_date);
                                } catch (e) {
                                    var timestamps_end = await this.utilsService.getDateTimeString();
                                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                                    this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                    await this.errorHandler.generateNotAcceptableException(
                                        'Unabled to proceed, ' + e,
                                    );
                                }

                                if (watching_time > 0 && watching_time > AdsSkip) {
                                    //Update ads
                                    try {
                                        var CreateAdsDto_ = new CreateAdsDto();
                                        CreateAdsDto_.usedCredit = used_credit;
                                        CreateAdsDto_.usedCreditFree = used_credit_free;
                                        CreateAdsDto_.totalView = ads_totalView + 1;
                                        if ((ads_totalView + 1) == ads_tayang) {
                                            CreateAdsDto_.isActive = false;
                                            CreateAdsDto_.status = 'FINISH';
                                        }
                                        await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                                    } catch (e) {
                                        var timestamps_end = await this.utilsService.getDateTimeString();
                                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                        await this.errorHandler.generateNotAcceptableException(
                                            'Unabled to proceed, ' + e,
                                        );
                                    }
                                }

                                if ((ads_totalView + 1) == ads_tayang) {
                                    var CreateUserAdsDto_ = new CreateUserAdsDto();
                                    CreateUserAdsDto_.isActive = false;
                                    await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
                                }

                                if (rewards) {
                                    var currentDate = await this.utilsService.getDateTime();
                                    //Update accountbalace
                                    try {
                                        var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
                                        CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
                                        CreateAccountbalancesDto_.debet = 0;
                                        CreateAccountbalancesDto_.kredit = ads_rewards;
                                        CreateAccountbalancesDto_.type = "rewards";
                                        CreateAccountbalancesDto_.timestamp = currentDate.toISOString();
                                        CreateAccountbalancesDto_.description = "rewards form ads view";
                                        CreateAccountbalancesDto_.idtrans = new mongoose.Types.ObjectId(data_userAdsService.adsID.toString());
                                        await this.accountbalancesService.create(CreateAccountbalancesDto_);
                                    } catch (e) {
                                        var timestamps_end = await this.utilsService.getDateTimeString();
                                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                        console.log('Unabled to proceed, ' + e);
                                    }

                                    try {
                                        var eventType = "TRANSACTION";
                                        var event = "ADS VIEW";
                                        await this.utilsService.sendFcmV2(data_userbasicsService.email.toString(), data_userbasicsService.email.toString(), eventType, event, "REWARDS", null, null, null, ads_rewards.toString());
                                    } catch (e) {
                                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed " + e);
                                        console.log('Unabled to proceed, ' + e);
                                    }
                                }
                            }

                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                            this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, successfully " + rewards.toString());

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
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                            this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed User Ads not found',
                            );
                        }
                    }
                    release();
                } catch (error) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    release();
                    throw error;
                } finally {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    release();
                }
            });
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed token and email not match");
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/clickads/')
    @HttpCode(HttpStatus.ACCEPTED)
    async clickads(@Headers() headers, @Body() body, @Request() request): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_start = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(body));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START headers : " + JSON.stringify(headers));
        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> START body : " + JSON.stringify(body));
        if (await this.utilsService.validasiTokenEmail(headers)) {
            var user_email = null;
            var watching_time = null;
            var ads_id = null;
            var userads_id = null;
            var current_date = await this.utilsService.getDateTimeString();

            if (body.watchingTime == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime is reqired',
                );
            }
            if (typeof body.watchingTime != 'number') {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param watchingTime invalid format " + typeof body.watchingTime);
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param watchingTime invalid format ' + typeof body.watchingTime,
                );
            }
            if (body.adsId == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param adsId is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param adsId is reqired',
                );
            }
            if (body.useradsId == undefined) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed param useradsId is reqired");
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed param useradsId is reqired',
                );
            }

            user_email = headers['x-auth-user'];
            watching_time = body.watchingTime;
            ads_id = body.adsId;
            userads_id = body.useradsId;
            var rewards = false;

            if (!this.locks.has(user_email)) {
                this.locks.set(user_email, new Mutex());
            }
            return this.locks.get(user_email).acquire().then(async (release) => {
                try {
                    const data_userbasicsService = await this.userbasicsService.findOne(user_email);
                    if (!(await this.utilsService.ceckData(data_userbasicsService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed User not found',
                        );
                    }

                    const data_adsService = await this.adsService.findOneActive(ads_id.toString());
                    if (!(await this.utilsService.ceckData(data_adsService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Ads not found',
                        );
                    }

                    const data_adstypesService = await this.adstypesService.findOne(data_adsService.typeAdsID.toString());
                    if (!(await this.utilsService.ceckData(data_adstypesService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads types not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Ads types not found',
                        );
                    }

                    if (data_adstypesService.AdsSkip == undefined) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Skip not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Skip not found',
                        );
                    }

                    if (data_adstypesService.creditValue == undefined) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed Ads Credit not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed data setting Ads Credit not found',
                        );
                    }

                    const data_userAdsService = await this.userAdsService.getAdsUser(userads_id.toString());
                    if (!(await this.utilsService.ceckData(data_userAdsService))) {
                        var timestamps_end = await this.utilsService.getDateTimeString();
                        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                        this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> END, Unabled to proceed User Ads not found");
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed User Ads not found',
                        );
                    }

                    var credit_view = data_adstypesService.creditValue;
                    var AdsSkip = data_adstypesService.AdsSkip;
                    var ads_rewards = data_adstypesService.rewards;

                    var userAds_liveTypeuserads = (data_userAdsService.liveTypeuserads != undefined) ? data_userAdsService.liveTypeuserads : false;
                    var userAds_statusView = (data_userAdsService.statusView != undefined) ? data_userAdsService.statusView : false;
                    var userAds_statusClick = (data_userAdsService.statusClick != undefined) ? data_userAdsService.statusClick : false;
                    var userAds_timeViewSecond = (data_userAdsService.timeViewSecond != undefined) ? data_userAdsService.timeViewSecond : null;
                    var userAds_viewed = (data_userAdsService.viewed != undefined) ? data_userAdsService.viewed : 0;

                    var userID = (data_userAdsService.userID != undefined) ? data_userAdsService.userID.toString() : null;
                    var adsID = (data_userAdsService.adsID != undefined) ? data_userAdsService.adsID.toString() : null;

                    var ads_tayang = data_adsService.tayang;
                    var ads_totalView = 0;
                    if (data_adsService.totalView != undefined) {
                        ads_totalView = data_adsService.totalView;
                    }

                    var credit = data_adsService.creditValue;
                    var credit_free = data_adsService.creditFree;
                    var used_credit = data_adsService.usedCredit;
                    var used_credit_free = data_adsService.usedCreditFree;

                    //GetSaldo
                    let Saldo = 0;
                    var GetSaldo = await this.accountbalancesService.findwallettotalsaldo(data_userbasicsService._id);
                    if (await this.utilsService.ceckData(GetSaldo)) {
                        if (GetSaldo.length > 0) {
                            Saldo += GetSaldo[0].totalsaldo;
                        }
                    }

                    if ((ads_totalView + 1) <= ads_tayang) {
                        const sisa_credit = credit - (used_credit + credit_view);
                        const sisa_credit_free = credit_free - (used_credit_free + credit_view);
                        let sisa_credit_view = 0;
                        if (sisa_credit == 0) {
                            used_credit = used_credit + credit_view;
                        } else if (sisa_credit > 0) {
                            if (watching_time > (AdsSkip - 1)) {
                                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, AdsSkip : " + AdsSkip.toString());
                                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, watching_time : " + watching_time.toString());
                                this.logger.log("VIEW ADS >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PROCCES, rewards : " + rewards.toString());
                                if (userAds_liveTypeuserads) {
                                    if ((userID != null) && (adsID != null)) {
                                        const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
                                        if (await this.utilsService.ceckData(ceck_rewars)) {
                                            rewards = false;
                                        } else {
                                            rewards = true;
                                            // if (Saldo < 49000) {
                                            //     rewards = true;
                                            // } else {
                                            //     rewards = false;
                                            // }
                                        }
                                    }
                                } else {
                                    if ((userID != null) && (adsID != null)) {
                                        const ceck_rewars = await this.userAdsService.findUserAdsRewars(userID, adsID, AdsSkip);
                                        if (await this.utilsService.ceckData(ceck_rewars)) {
                                            rewards = false;
                                        } else {
                                            rewards = true;
                                            // if (Saldo < 49000) {
                                            //     rewards = true;
                                            // } else {
                                            //     rewards = false;
                                            // }
                                        }
                                    }
                                    //rewards = true;
                                }
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

                        //Update userads
                        try {
                            var CreateUserAdsDto_ = new CreateUserAdsDto();
                            CreateUserAdsDto_.statusView = true;
                            CreateUserAdsDto_.statusClick = true;
                            CreateUserAdsDto_.clickAt = current_date;
                            if (userAds_liveTypeuserads) {
                                CreateUserAdsDto_.viewed = userAds_viewed + 1;
                                CreateUserAdsDto_.viewedUnder = 0;
                            } else {
                                CreateUserAdsDto_.viewed = 1;
                                CreateUserAdsDto_.viewedUnder = 0;
                            }
                            CreateUserAdsDto_.timeViewSecond = watching_time;
                            await this.userAdsService.updatesdataUserId_(data_userAdsService._id.toString(), CreateUserAdsDto_);
                            this.userAdsService.updateUpdateAt(data_userAdsService._id.toString(), current_date);
                            this.userAdsService.updateClickTime(data_userAdsService._id.toString(), current_date);
                        } catch (e) {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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
                            if ((ads_totalView + 1) == ads_tayang) {
                                CreateAdsDto_.isActive = false;
                                CreateAdsDto_.status = 'FINISH';
                            }
                            await this.adsService.update(data_adsService._id.toString(), CreateAdsDto_);
                        } catch (e) {
                            var timestamps_end = await this.utilsService.getDateTimeString();
                            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed, ' + e,
                            );
                        }

                        if (ads_totalView == ads_tayang) {
                            var CreateUserAdsDto_ = new CreateUserAdsDto();
                            CreateUserAdsDto_.isActive = false;
                            await this.userAdsService.updatesAlladsNotActive(data_userAdsService.adsID.toString(), CreateUserAdsDto_);
                        }

                        if (rewards) {
                            //Update accountbalace
                            var currentDate = await this.utilsService.getDateTime();
                            try {
                                var CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
                                CreateAccountbalancesDto_.iduser = data_userbasicsService._id;
                                CreateAccountbalancesDto_.debet = 0;
                                CreateAccountbalancesDto_.kredit = ads_rewards;
                                CreateAccountbalancesDto_.type = "rewards";
                                CreateAccountbalancesDto_.timestamp = currentDate.toISOString();
                                CreateAccountbalancesDto_.description = "rewards form ads click";
                                CreateAccountbalancesDto_.idtrans = new mongoose.Types.ObjectId(data_userAdsService.adsID.toString());
                                await this.accountbalancesService.create(CreateAccountbalancesDto_);
                            } catch (e) {
                                console.log('Unabled to proceed, ' + e);
                            }


                            try {
                                // var titleinsukses = "Reward";
                                // var titleensukses = "Reward";
                                // var bodyinsukses = "Selamat kamu mendapatkan reward Rp." + ads_rewards;
                                // var bodyensukses = "Congratulation you've got a reward Rp." + ads_rewards;
                                var eventType = "TRANSACTION";
                                var event = "ADS CLICK";
                                await this.utilsService.sendFcmV2(data_userbasicsService.email.toString(), data_userbasicsService.email.toString(), eventType, event, "REWARDS", null, null, null, ads_rewards.toString())
                                //await this.utilsService.sendFcm(data_userbasicsService.email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
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
                                var timestamps_end = await this.utilsService.getDateTimeString();
                                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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

                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    return {
                        response_code: 202,
                        data: {
                            userAds_id: data_userAdsService._id.toString()
                        },
                        messages: {
                            info: ['successfully'],
                        },
                    };
                } catch (error) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    release();
                    throw error;
                } finally {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    release();
                }
            }); 
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/update/')
    @HttpCode(HttpStatus.ACCEPTED)
    async update(@Body() body, @Request() request, @Headers() headers): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_start = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(body));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        if (body.adsId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param adsId is reqired',
            );
        }
        if (body.tayang == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param tayang is reqired',
            );
        }
        if (body.userVoucherID == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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
            //await this.adsUserCompareService.createUserAds(CreateAdsDto_);
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Ads not found',
            );
        }
    }
}
