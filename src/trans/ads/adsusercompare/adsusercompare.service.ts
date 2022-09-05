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
        var UserSelfInsert = 0;
        UserSelfInsert = await this.utilsService.getSetting("UserSelfInsert");
        
        data_user.forEach(async element => {
            //if (element._id == _CreateAdsDto_.userID) {
                if (element._id == _CreateAdsDto_.userID) {
                    if (UserSelfInsert) {

                    }
                }
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

                var priority = "Very Lowest";
                var priority_number = await this.utilsService.getSetting("VeryLowest");
                var priority_interest = false;
                var priority_gender = false;
                var priority_location = false;
                var priority_age = false;

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

                //Compare Interes
                if (Count_compare_interest > 0) {
                    priority_interest = true;
                }

                //Compare Age
                if ((data_ads.startAge != undefined) && (data_ads.endAge != undefined) && (element.dob != undefined)) {
                    console.log("Date Now", new Date(Date.now()));
                    var date_end_age_int = new Date().setFullYear(new Date().getFullYear() - data_ads.endAge);
                    var date_end_age = new Date(new Date().setFullYear(new Date().getFullYear() - data_ads.endAge));
                    console.log("date_end_age", date_end_age);
                    console.log("date_end_age_int", date_end_age_int);
                    var date_start_age_int = new Date().setFullYear(new Date().getFullYear() - data_ads.startAge);
                    var date_start_age = new Date(new Date().setFullYear(new Date().getFullYear() - data_ads.startAge));
                    console.log("date_start_age", date_start_age);
                    console.log("date_start_age_int", date_start_age_int);
                    var date_dob_int = new Date(element.dob.toString()).getTime();
                    var date_dob = new Date(element.dob.toString());
                    console.log("date_dob", date_dob);
                    console.log("date_dob_int", date_dob_int);
                    if ((date_end_age_int <= date_dob_int) && (date_dob_int <= date_start_age_int)) {
                        priority_age = true;
                    }else{
                        priority_age = false;
                    }
                }else{
                    priority_age = true;
                }

                //Compare Gender
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

                //Compare Location
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

                console.log("----------------------------------------------------------");
                console.log("priority_interest", priority_interest);
                console.log("priority_gender", priority_gender);
                console.log("priority_location", priority_location);
                console.log("priority_age", priority_age);
                console.log("----------------------------------------------------------");

                if (priority_interest && priority_gender && priority_location && priority_age) {
                    priority = "Highest";
                    priority_number = await this.utilsService.getSetting("Highest");
                } else {
                    if (priority_interest && priority_gender && priority_age) {
                        priority = "High";
                        priority_number = await this.utilsService.getSetting("High"); 
                    } else {
                        if (priority_interest && priority_location && priority_age) {
                            priority = "Medium";
                            priority_number = await this.utilsService.getSetting("Medium"); 
                        } else {
                            if (priority_interest && priority_age) {
                                priority = "Low";
                                priority_number = await this.utilsService.getSetting("Low"); 
                            } else {
                                if (priority_gender && priority_age) {
                                    priority = "Very Low";
                                    priority_number = await this.utilsService.getSetting("VeryLow"); 
                                }else{
                                    priority = "Very Lowest";
                                    priority_number = await this.utilsService.getSetting("VeryLowest");
                                }
                            }
                        }
                    }
                }
                console.log("ads priority", priority);
                console.log("----------------------------------------------------------");

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
                    CreateUserAdsDto_.liveTypeuserads = data_ads.liveTypeAds;
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

    async createNewUserAds(userId: string) {
        var data_user = await this.userbasicsService.findbyid(userId);
        var data_ads = await this.adsService.findAllActive();

        var current_date = await this.utilsService.getDateTimeString();

        //------------data user location------------//
        var user_location_long = null;
        var user_location_lat = null;

        var data_user_auth = await this.userauthsService.findOneByEmail(data_user.email);
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

        //------------data user interes------------//
        var user_array_interest = data_user.userInterests;
        var user_array_interest_toString = null;
        var user_array_interest_string = null;

        if (user_array_interest.length > 0) {
            user_array_interest_toString = user_array_interest.map(function (item) {
                if ((JSON.parse(JSON.stringify(item)) != null)) {
                    return '"' + JSON.parse(JSON.stringify(item)).$id + '"'
                }
            }).join(",");
            user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
        }

        for (var i = 0; i < data_ads.length; i++) {
            var priority = "Very Lowest";
            var priority_number = await this.utilsService.getSetting("VeryLowest");
            var priority_interest = false;
            var priority_gender = false;
            var priority_location = false;
            var priority_age = false;

            //------------data ads location------------//
            var ads_location_long = null;
            var ads_location_lat = null;

            var data_area = await this.areasService.findOneid(JSON.parse(JSON.stringify(data_ads[i].demografisID)).$id);
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

            //Compare Location
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

            //------------data ads interes------------//
            var ads_array_interest = data_ads[i].interestID;
            var ads_array_interest_toString = null;
            var ads_array_interest_string = null;

            var compare_interest = null;
            var Count_compare_interest = null;

            if (ads_array_interest.length > 0) {
                ads_array_interest_toString = ads_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
                ads_array_interest_string = JSON.parse("[" + ads_array_interest_toString + "]");
            }

            //Compare Interes
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

            //Compare Age
            if ((data_ads[0].startAge != undefined) && (data_ads[0].endAge != undefined) && (data_user.dob != undefined)) {
                console.log("Date Now", new Date(Date.now()));
                var date_end_age_int = new Date().setFullYear(new Date().getFullYear() - data_ads[0].endAge);
                var date_end_age = new Date(new Date().setFullYear(new Date().getFullYear() - data_ads[0].endAge));
                console.log("date_end_age", date_end_age);
                console.log("date_end_age_int", date_end_age_int);
                var date_start_age_int = new Date().setFullYear(new Date().getFullYear() - data_ads[0].startAge);
                var date_start_age = new Date(new Date().setFullYear(new Date().getFullYear() - data_ads[0].startAge));
                console.log("date_start_age", date_start_age);
                console.log("date_start_age_int", date_start_age_int);
                var date_dob_int = new Date(data_user.dob.toString()).getTime();
                var date_dob = new Date(data_user.dob.toString());
                console.log("date_dob", date_dob);
                console.log("date_dob_int", date_dob_int);
                if ((date_end_age_int <= date_dob_int) && (date_dob_int <= date_start_age_int)) {
                    priority_age = true;
                } else {
                    priority_age = false;
                }
            } else {
                priority_age = true;
            }

            //Compare Gender
            if (data_ads[0].gender.toLowerCase() == "l") {
                if (data_user.gender != undefined) {
                    if ((data_user.gender.toLowerCase() == "male") || (data_user.gender.toLowerCase() == "laki-laki")) {
                        priority_gender = true;
                    }
                }
            } else {
                if (data_user.gender != undefined) {
                    if ((data_user.gender.toLowerCase() == "female") || (data_user.gender.toLowerCase() == "Perempuan")) {
                        priority_gender = true;
                    }
                }
            }

            console.log("----------------------------------------------------------");
            console.log("priority_interest", priority_interest);
            console.log("priority_gender", priority_gender);
            console.log("priority_location", priority_location);
            console.log("priority_age", priority_age);
            console.log("----------------------------------------------------------");

            if (priority_interest && priority_gender && priority_location && priority_age) {
                priority = "Highest";
                priority_number = await this.utilsService.getSetting("Highest");
            } else {
                if (priority_interest && priority_gender && priority_age) {
                    priority = "High";
                    priority_number = await this.utilsService.getSetting("High");
                } else {
                    if (priority_interest && priority_location && priority_age) {
                        priority = "Medium";
                        priority_number = await this.utilsService.getSetting("Medium");
                    } else {
                        if (priority_interest && priority_age) {
                            priority = "Low";
                            priority_number = await this.utilsService.getSetting("Low");
                        } else {
                            if (priority_gender && priority_age) {
                                priority = "Very Low";
                                priority_number = await this.utilsService.getSetting("VeryLow");
                            } else {
                                priority = "Very Lowest";
                                priority_number = await this.utilsService.getSetting("VeryLowest");
                            }
                        }
                    }
                }
            }
            console.log("ads priority", priority);
            console.log("----------------------------------------------------------");

            var CreateUserAdsDto_ = new CreateUserAdsDto();
            try {
                CreateUserAdsDto_._id = new mongoose.Types.ObjectId();
                CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(data_ads[0]._id.toString());
                CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(data_user._id.toString());
                CreateUserAdsDto_.priority = priority;
                CreateUserAdsDto_.priorityNumber = priority_number;
                if (data_ads[0].description != undefined) {
                    CreateUserAdsDto_.description = data_ads[0].description;
                }
                CreateUserAdsDto_.createdAt = current_date;
                CreateUserAdsDto_.statusClick = false;
                CreateUserAdsDto_.statusView = false;
                CreateUserAdsDto_.viewed = 0;
                CreateUserAdsDto_.liveAt = data_ads[0].liveAt;
                CreateUserAdsDto_.liveTypeuserads = data_ads[0].liveTypeAds;
                await this.userAdsService.create(CreateUserAdsDto_);
            } catch (s) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Failed update Ads',
                );
            }
        }
    }

    async getListUserAds(limit:number): Promise<UserAds[]>{
        return await await this.userAdsService.findAllLimit(limit);
    }   
}
