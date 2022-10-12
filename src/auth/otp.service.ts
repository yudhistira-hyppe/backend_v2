import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserbasicsnewService } from '../trans/newuserbasic/userbasicsnew.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { CountriesService } from '../infra/countries/countries.service';
import { AreasService } from '../infra/areas/areas.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { InsightsService } from '../content/insights/insights.service';
import { InterestsService } from '../infra/interests/interests.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { CreateActivityeventsDto } from '../trans/activityevents/dto/create-activityevents.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Double, Int32, ObjectId } from 'mongodb';
import { UtilsService } from '../utils/utils.service';
import { ErrorHandler } from '../utils/error.handler';
import { Templates } from '../infra/templates/schemas/templates.schema';
import { CreateUserbasicDto } from '../trans/userbasics/dto/create-userbasic.dto';
import { CreateUserauthDto } from '../trans/userauths/dto/create-userauth.dto';
import { CreateInsightsDto } from '../content/insights/dto/create-insights.dto';
import { CitiesService } from '../infra/cities/cities.service';
import { ReferralService } from '../trans/referral/referral.service';
import { CreateReferralDto } from '../trans/referral/dto/create-referral.dto';
import mongoose from 'mongoose';
import { SeaweedfsService } from '../stream/seaweedfs/seaweedfs.service'; 
import { AdsUserCompareService } from '../trans/ads/adsusercompare/adsusercompare.service';
import { Long } from 'mongodb';
import * as fs from 'fs';
import { ContenteventsService } from '../content/contentevents/contentevents.service';
import { CreateContenteventsDto } from '../content/contentevents/dto/create-contentevents.dto';
import { CreateGetcontenteventsDto } from '../trans/getusercontents/getcontentevents/dto/create-getcontentevents.dto';
import { CreateUserbasicnewDto } from '../trans/newuserbasic/dto/create-userbasicnew.dto';
import { CreatePostResponse, Messages } from 'src/content/posts/dto/create-posts.dto';

@Injectable()
export class OtpService {

    private readonly logger = new Logger(OtpService.name);    

  constructor(
    private userbasicsnewService: UserbasicsnewService,
    private userauthsService: UserauthsService,
    private jwtService: JwtService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private countriesService: CountriesService,
    private languagesService: LanguagesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    //private interestsService: InterestsService,
    private interestsRepoService: InterestsRepoService,
    private activityService: ActivityeventsService,
    private areasService: AreasService,
    private utilsService: UtilsService,
    private errorHandler: ErrorHandler,
    private citiesService: CitiesService,
    private referralService: ReferralService,
    private seaweedfsService: SeaweedfsService, 
    private adsUserCompareService: AdsUserCompareService,
    private contenteventsService: ContenteventsService,
  ) { }

  public async resendOtp(body: any) {

    var res = new CreatePostResponse();
    res.response_code = 204;

    let profile = await this.userbasicsService.findOne(body.email);
    if (profile == undefined) {
        let msg = new Messages();
        msg.info = ["Profile unknown"];
        res.messages = msg;
        return res;                
    }

    let auth = await this.userauthsService.findOneByEmail(profile.email);
    if (auth == undefined) {
        let msg = new Messages();
        msg.info = ["Auth unknown"];
        res.messages = msg;
        return res;                
    }    

    let act = this.activityService.findParentWitoutDevice(String(profile.email), 'RESENT_OTP', false);
    if (act == undefined) {
        let msg = new Messages();
        msg.info = ["Activity unknown"];
        res.messages = msg;
        return res;                
    }

    return res;
  }
}