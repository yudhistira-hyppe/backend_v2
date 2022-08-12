import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds, UserAdsDocument } from './schemas/userads.schema';
import { AdsService } from '../ads/ads.service';
import { UtilsService } from '../../utils/utils.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import { ErrorHandler } from '../../utils/error.handler'; 
import { AreasService } from '../../infra/areas/areas.service';
import { Double } from 'mongodb';

@Injectable()
export class UserAdsService {
    constructor(@InjectModel(UserAds.name, 'SERVER_TRANS')
    private readonly userAdsModel: Model<UserAdsDocument>,
        private readonly adsService: AdsService,
        private readonly utilsService: UtilsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userauthsService: UserauthsService,
        private readonly areasService: AreasService, 
    ) { }

    async createUserAds(_CreateUserAdsDto_: CreateUserAdsDto): Promise<Object> {
        if (_CreateUserAdsDto_.adsID == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed',
            );
        }
        var ads_location_long = null;
        var ads_location_lat = null;

        var current_date = await this.utilsService.getDateTimeString();
        var data_user = await this.userbasicsService.findAll();
        var data_ads = await this.adsService.findOne(_CreateUserAdsDto_.adsID.toString());
        if (await this.utilsService.ceckData(data_ads)) {
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

        data_user.forEach(async element => {
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
            var priority_interest = false;
            var priority_gender = false;
            var priority_location = false;
            
            const ads_array_interest_toString = ads_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
            const ads_array_interest_string = JSON.parse("[" + ads_array_interest_toString + "]");

            const user_array_interest_toString = user_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
            const user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");

            const compare_interest = ads_array_interest_string.filter(function (obj) {
                return user_array_interest_string.indexOf(obj) !== -1;
            });
            const Count_compare_interest = compare_interest.length;

            if (Count_compare_interest>0){
                priority_interest = true;
            }

            if (data_ads.gender.toLowerCase() =="l"){
                if (element.gender != undefined) {
                    if ((element.gender.toLowerCase() == "male") || (element.gender.toLowerCase() == "laki-laki")) {
                        priority_gender = true;
                    }
                }
            }else{
                if (element.gender != undefined) {
                    if ((element.gender.toLowerCase() == "female") || (element.gender.toLowerCase() == "Perempuan")) {
                        priority_gender = true;
                    }
                }
            }

            if ((user_location_long != null) && (user_location_lat != null) && (ads_location_long != null) && (ads_location_lat != null)) {
                if (typeof user_location_long == 'string'){
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
                console.log(a)
                console.log(b)
                const haversine = require('haversine-distance')
                var distance_m = haversine(a, b);
                var distance_km = distance_m/1000;
                
                var setting = await this.utilsService.getSetting('Distance');
                if (distance_km <= setting){
                    priority_location = true;
                }
            }

            if (priority_interest && priority_gender && priority_location){
                priority = "Highest";
            }else{
                if (priority_interest && priority_gender) {
                    priority = "High";
                }else{
                    if (priority_interest && priority_location) {
                        priority = "Medium";
                    }else{
                        if (priority_interest) {
                            priority = "Low";
                        }else{
                            if (priority_gender) {
                                priority = "Lowest";
                            }
                        }
                    }
                }
            }

            var CreateUserAdsDto_ = new CreateUserAdsDto();

            CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(_CreateUserAdsDto_._id.toString());
            CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(element._id.toString());
            CreateUserAdsDto_.priority = priority;
            if (_CreateUserAdsDto_.description!=undefined){
                CreateUserAdsDto_.description = _CreateUserAdsDto_.description; 
            }
            CreateUserAdsDto_.createdAt = current_date; 
            CreateUserAdsDto_.statusClick = 'NO';
            CreateUserAdsDto_.statusView = 'NO'; 
            CreateUserAdsDto_.viewed = new Double(0);
            const createUserAdsDto = await this.userAdsModel.create(CreateUserAdsDto_);
        });
        return _CreateUserAdsDto_;
    }
}
