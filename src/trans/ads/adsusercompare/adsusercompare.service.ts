import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Double } from 'mongodb';
import mongoose, { Model } from 'mongoose';
import { CreateUserAdsDto } from '../../../trans/userads/dto/create-userads.dto';
import { AreasService } from '../../../infra/areas/areas.service';
import { UserauthsService } from '../../../trans/userauths/userauths.service';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { UtilsService } from '../../../utils/utils.service';
import { AdsService } from '../ads.service';
import { UserAdsService } from '../../../trans/userads/userads.service';
import { CreateAdsDto } from '../dto/create-ads.dto';
import { UserAds } from 'src/trans/userads/schemas/userads.schema';

@Injectable()
export class AdsUserCompareService {
    constructor(
        private readonly adsService: AdsService,
        private readonly utilsService: UtilsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userauthsService: UserauthsService,
        private readonly areasService: AreasService,
        private readonly userAdsService: UserAdsService,
    ) { }

    async createUserAds(_CreateAdsDto_: CreateAdsDto): Promise<any> {
        if (_CreateAdsDto_._id == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }
        var ads_location_long = null;
        var ads_location_lat = null;

        var current_date = await this.utilsService.getDateTimeString();
        var data_user = await this.userbasicsService.findAll();
        var data_ads = await this.adsService.findOne(_CreateAdsDto_._id.toString());
        if (await this.utilsService.ceckData(data_ads)) {
            if (data_ads.isActive && data_ads.status == 'APPROVE') {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, Ads status is live',
                );
            } 
            var data_area = await this.areasService.findOneid(JSON.parse(JSON.stringify(data_ads.demografisID)).$id);
            if (await this.utilsService.ceckData(data_area)) {
                if (data_area.location != undefined) {
                    if (data_area.location.longtitude != undefined) {
                        ads_location_long = data_area.location.longtitude;
                    }
                    if (data_area.location.latitude != undefined) {
                        ads_location_lat = data_area.location.latitude;
                    }
                }
            }
        }
        var UserSelfInsert = true;
        //UserSelfInsert = await this.utilsService.getSetting("UserSelfInsert");
        data_user.forEach(async element => {
            //if (element._id == _CreateAdsDto_.userID) {
                var data_user_auth = await this.userauthsService.findOneByEmail(element.email);
                var user_location_long = null;
                var user_location_lat = null;
                if (await this.utilsService.ceckData(data_user_auth)) {
                    if (data_user_auth.location != undefined) {
                        if (data_user_auth.location.longitude != undefined) {
                            user_location_long = data_user_auth.location.longitude;
                        }
                        if (data_user_auth.location.latitude != undefined) {
                            user_location_lat = data_user_auth.location.latitude;
                        }
                    }
                }

                var ads_array_interest = data_ads.interestID;
                var user_array_interest = element.userInterests;

                var priority = "Lowest";
                var priority_number = 4;
                var priority_interest = false;
                var priority_gender = false;
                var priority_location = false;

                var ads_array_interest_toString = null;
                var ads_array_interest_string = null;
                var user_array_interest_toString = null;
                var user_array_interest_string = null;

                var compare_interest = null;
                var Count_compare_interest = null;

                if (ads_array_interest.length > 0) {
                    ads_array_interest_toString = ads_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
                    ads_array_interest_string = JSON.parse("[" + ads_array_interest_toString + "]");
                }
                if (user_array_interest.length > 0) {
                    user_array_interest_toString = user_array_interest.map(function (item) { 
                        if ((JSON.parse(JSON.stringify(item)) != null)) {
                            return '"' + JSON.parse(JSON.stringify(item)).$id + '"' 
                        }
                    }).join(",");
                    user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
                }
                if (ads_array_interest_string != null && user_array_interest_string != null) {
                    compare_interest = ads_array_interest_string.filter(function (obj) {
                        return user_array_interest_string.indexOf(obj) !== -1;
                    });
                }
                if (compare_interest != null) {
                    Count_compare_interest = compare_interest.length;
                }

                if (Count_compare_interest > 0) {
                    priority_interest = true;
                }

                if (data_ads.gender.toLowerCase() == "l") {
                    if (element.gender != undefined) {
                        if ((element.gender.toLowerCase() == "male") || (element.gender.toLowerCase() == "laki-laki")) {
                            priority_gender = true;
                        }
                    }
                } else {
                    if (element.gender != undefined) {
                        if ((element.gender.toLowerCase() == "female") || (element.gender.toLowerCase() == "Perempuan")) {
                            priority_gender = true;
                        }
                    }
                }

                if ((user_location_long != null) && (user_location_lat != null) && (ads_location_long != null) && (ads_location_lat != null)) {
                    if (typeof user_location_long == 'string') {
                        user_location_long = parseFloat(user_location_long);
                    }
                    if (typeof user_location_lat == 'string') {
                        user_location_lat = parseFloat(user_location_lat);
                    }
                    if (typeof ads_location_long == 'string') {
                        ads_location_long = parseFloat(ads_location_long);
                    }
                    if (typeof ads_location_lat == 'string') {
                        ads_location_lat = parseFloat(ads_location_lat);
                    }
                    const a = { latitude: user_location_lat, longitude: user_location_long }
                    const b = { latitude: ads_location_lat, longitude: ads_location_long }
                    
                    const haversine = require('haversine-distance')
                    var distance_m = haversine(a, b);
                    var distance_km = distance_m / 1000;

                    var setting = await this.utilsService.getSetting('Distance');
                    if (distance_km <= setting) {
                        priority_location = true;
                    }
                }

                if (priority_interest && priority_gender && priority_location) {
                    priority = "Highest"; 
                    priority_number = 1; 
                } else {
                    if (priority_interest && priority_gender) {
                        priority = "High";
                        priority_number = 1; 
                    } else {
                        if (priority_interest && priority_location) {
                            priority = "Medium";
                            priority_number = 2; 
                        } else {
                            if (priority_interest) {
                                priority = "Low";
                                priority_number = 3; 
                            } else {
                                if (priority_gender) {
                                    priority = "Lowest";
                                    priority_number = 4; 
                                }
                            }
                        }
                    }
                }

                var CreateUserAdsDto_ = new CreateUserAdsDto();
                try {
                    CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                    CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(_CreateAdsDto_._id.toString());
                    CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(element._id.toString());
                    CreateUserAdsDto_.priority = priority;
                    CreateUserAdsDto_.priorityNumber = priority_number;
                    if (_CreateAdsDto_.description != undefined) {
                        CreateUserAdsDto_.description = _CreateAdsDto_.description;
                    }
                    CreateUserAdsDto_.createdAt = current_date;
                    CreateUserAdsDto_.statusClick = false;
                    CreateUserAdsDto_.statusView = false;
                    CreateUserAdsDto_.viewed = 0;
                    CreateUserAdsDto_.liveAt = _CreateAdsDto_.liveAt;
                    const createUserAdsDto = await this.userAdsService.create(CreateUserAdsDto_);
                } catch (s) {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed Failed update Ads',
                    );
                }
            //}
        });
        try {
            await this.adsService.update(_CreateAdsDto_._id.toString(), _CreateAdsDto_);
        } catch (s) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Failed update Ads',
            );
        }
        return _CreateAdsDto_;
    }

    async getListUserAds(limit:number): Promise<UserAds[]>{
        return await await this.userAdsService.findAllLimit(limit);
    }
}
