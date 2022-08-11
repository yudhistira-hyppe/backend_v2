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
            
            var priority_interest = false;
            var priority_gender = false;
            var priority_location = false;

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
                var data_distance = await this.utilsService.ceckDistance(user_location_long, user_location_lat, ads_location_long, ads_location_lat);
                console.log("data_distance "+data_distance);
            }
            





            // var CreateUserAdsDto_ = new CreateUserAdsDto();

            // CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(_CreateUserAdsDto_._id.toString());
            // CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(element._id.toString());
            // if (_CreateUserAdsDto_.description!=undefined){
            //     CreateUserAdsDto_.description = _CreateUserAdsDto_.description; 
            // }
            // CreateUserAdsDto_.createdAt = current_date; 
            // CreateUserAdsDto_.statusClick = 'NO';
            // CreateUserAdsDto_.statusView = 'NO'; 
            // CreateUserAdsDto_.viewed = new Double(0);
            // const createUserAdsDto = await this.userAdsModel.create(CreateUserAdsDto_);
        });


            
            //CreateUserAdsDto_.createdAt = current_date;
                //console.log(element.profileID)
            // if (element.profileID == 'ef9007ed-732a-41e6-9708-542026257497') {

            //     let intersection = user_array_interest.filter(element_ =>
            //         !ads_array_interest.includes(element_)
                    
            //     );
                // console.log(user_array_interest.diff(ads_array_interest));
                // console.log(ads_array_interest);
                // console.log(user_array_interest);
                // console.log(intersection);
                //}
            // let result = ads_array_interest.every(function (element_) {
            //     return user_array_interest.includes(element_);
            // });
            //var priority_interest = false;
            // for (var i = 0; i < element.userInterests.length;i++){
            //     var ads_array_interest = data_ads.interestID;
            //     var user_array_interest = element.element;
            //     const found = array_interest.find(element_ => { console.log("user " + JSON.stringify(element_)); console.log("ads " + JSON.stringify(data_ads.interestID[i])); element_ == data_ads.interestID[i] });
                
            // }
            // var CreateUserAdsDto_ = new CreateUserAdsDto();

            // CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId(_CreateUserAdsDto_._id.toString());
            // if (_CreateUserAdsDto_.description!=undefined){
            //     CreateUserAdsDto_.description = _CreateUserAdsDto_.description; 
            // }
            // CreateUserAdsDto_.createdAt = current_date;


            // CreateUserAdsDto_.userID = new mongoose.Types.ObjectId(element._id.toString());
            // const createUserAdsDto = await this.userAdsModel.create(CreateUserAdsDto_);
        //});
        //const createUserAdsDto = await this.userAdsModel.create(_CreateUserAdsDto_);
        return _CreateUserAdsDto_;
    }
}
