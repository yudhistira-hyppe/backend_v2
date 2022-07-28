import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { TemplatesService } from '../infra/templates/templates.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer'; 
import { Templates } from '../infra/templates/schemas/templates.schema';
import * as admin from 'firebase-admin';
import { ErrorHandler } from './error.handler';
import { AvatarDTO, ProfileDTO } from './data/Profile';
import { LanguagesService } from '../infra/languages/languages.service';
import { InsightsService } from '../content/insights/insights.service';
import { CitiesService } from '../infra/cities/cities.service';
import { CountriesService } from '../infra/countries/countries.service';
import { AreasService } from '../infra/areas/areas.service'; 
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { InterestsService } from '../infra/interests/interests.service';
import { EulasService } from '../infra/eulas/eulas.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { CreateInsightsDto } from '../content/insights/dto/create-insights.dto';
import { SettingsService } from '../trans/settings/settings.service';
import { SeaweedfsService } from '../stream/seaweedfs/seaweedfs.service';
import * as fs from 'fs';
const cheerio = require('cheerio');
const QRCode = require('qrcode');
const nodeHtmlToImage = require('node-html-to-image');
var path = require("path");

@Injectable()
export class UtilsService {
  constructor(
    private userauthsService: UserauthsService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private templatesService: TemplatesService,
    private errorHandler: ErrorHandler, 
    private userbasicsService: UserbasicsService, 
    private languagesService: LanguagesService, 
    private insightsService: InsightsService,
    private citiesService: CitiesService,
    private countriesService: CountriesService,
    private areasService: AreasService, 
    private interestsRepoService: InterestsRepoService, 
    private interestsService: InterestsService,
    private eulasService: EulasService, 
    private mediaprofilepictsService: MediaprofilepictsService,
    private settingsService: SettingsService, 
    private seaweedfsService: SeaweedfsService, 
  ) {}

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    var sendEmail_ = false;
    await this.mailerService
      .sendMail({
        to: to,
        from: from,
        subject: subject,
        html: html,
      })
      .then((success) => {
        sendEmail_ = true;
        //console.log(success);
      })
      .catch((err) => {
        sendEmail_ = false;
        //console.log(err);
      });
    return sendEmail_;
  }

  async sendFcm(fcmtoken:string,payload:any){
    await admin.messaging().sendToDevice(fcmtoken, payload);
  }

  async getTemplate(type: string, category: string): Promise<Templates> {
    return await this.templatesService.findOneByTypeAndCategory(type, category);
  }

  async ceckUserByEmail(email: string): Promise<boolean> {
    var existing = false;
    var user_auth = await this.userauthsService.findOne(email);
    if (await this.ceckData(user_auth)) {
      existing = true;
    }
    return existing;
  }

  async comparePassword(
    password_request: string,
    password_existing: string,
  ): Promise<boolean> {
    var isMatch = false;
    isMatch = await bcrypt.compare(password_request, password_existing);
    return isMatch;
  }

  async OTPExpires(otpRequestTime: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpRequestTime) {
      isTrue = true;
    }
    return isTrue;
  }

  async OTPNextAttempExpires(otpNextAttemptAllow: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpNextAttemptAllow) {
      isTrue = true;
    }
    return isTrue;
  }

  async compareOTPAttemp(otpattemp: number): Promise<boolean> {
    var isTrue = false;
    if (otpattemp <= Number(process.env.OTP_ATTEMP_MAX)) {
      isTrue = true;
    }
    return isTrue;
  }

  async generateId(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var IdGenarate = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return IdGenarate;
  }

  async isAuthVerified(Data:any): Promise<boolean> {
    var isTrue = false;
    if(Data.isEmailVerified){
      if(!(Data.status=='NOTIFY')||!(Data.status=='INITIAL')){
        isTrue = true;
      }
    }
    return isTrue;
  }

  async ceckData(data: any): Promise<boolean> {
    var ceckdata = false;
    if (data != null) {
      if (data != undefined) {
        if (data.constructor.name === 'Array') {
          if (data.length > 0) {
            ceckdata = true;
          }
        } else if (data.constructor.name === 'Object') {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        } else {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        }
      }
    }
    return ceckdata;
  }

  async generateOTP(): Promise<String> {
    var result = '';
    for (var i = 0; i < Number(process.env.OTP_LEGHT); i++) {
      result += Math.floor(Math.random() * 9);
    }
    return result;
  }

  async generateOTPExpires(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_EXPIRATION_TIME),
    );
    return curent_date.getTime();
  }

  async generateOTPExpiresNextAttemptAllow(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_NEXT_ALLOW_MINUTE),
    );
    return curent_date.getTime();
  }

  async generateToken(email: string, deviceId: string) {
    const payload = {
      email: email,
      deviceId: deviceId,
    };
    return await this.jwtService.sign(payload);
  }

  async generateRefreshToken(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var refreshToken = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return refreshToken;
  }

  async generatePassword(password: string): Promise<string> {
    return await bcrypt.hashSync(password, 5);
  }

  async generateUsername(email: string): Promise<string> {
    var username = email.substring(0, email.indexOf('@'));
    var list_username = await this.userauthsService.findOneUsername(username);
    if (await this.ceckData(list_username)) {
      username += '_'+this.generateOTP();
    }
    return username;
  }

  async validateUsername(username: string): Promise<boolean> {
    var isTrue = false;
    var list_username = await this.userauthsService.findOneUsername(username);
    if (!(await this.ceckData(list_username))) {
      isTrue = true;
    }
    return isTrue;
  }

  async getDateTimeString(): Promise<string> {
    var DateTime = new Date().toISOString().replace('T', ' ');
    return DateTime.substring(0, DateTime.lastIndexOf('.'));
  }

  async getDateTimeDate(): Promise<Date> {
    return new Date();
  }

  async validasiEmail(email: string): Promise<boolean> {
    var valid_email = false;
    var atps = email.indexOf('@');
    var dots = email.lastIndexOf('.');
    if (atps < 1 || dots < atps + 2 || dots + 2 >= email.length) {
      valid_email = false;
    } else {
      valid_email = true;
    }
    return valid_email;
  }

  async validasiTokenEmail(head: any): Promise<boolean> {
    var isTrue = false;
    if (head != undefined) {
      if (head['x-auth-token']!=undefined){
        var email = head['x-auth-user'];
        var token = ((head['x-auth-token']).split(" "))[1];
        var data = await this.jwtService.decode(token);
        if (data != undefined) {
          if (data['email'] == email) {
            isTrue = true;
          }
        }
      }
    }
    return isTrue;
  }

  async descripToken(head: any): Promise<any> {
    if (head != undefined) {
      if (head['x-auth-token'] != undefined) {
        var token = ((head['x-auth-token']).split(" "))[1];
        var data = await this.jwtService.decode(token);
        return data;
      }
    }
    return null;
  }

  async validasiTokenEmailParam(bearer_token: string,email: string): Promise<boolean> {
    var isTrue = false;
    var email = email;
    var token = bearer_token.split(" ")[1];
    var data = await this.jwtService.decode(token);
    if(data!=undefined){
      if(data['email']==email){
        isTrue = true;
      }
    }
    return isTrue;
  }

  async createFolder(current_path: string, new_folder: string): Promise<boolean> {
    var isTrue = false;
    if (await fs.existsSync(path.resolve(current_path + new_folder))) {
      isTrue = true;
    } else {
      try {
        await fs.mkdirSync(path.resolve(current_path + new_folder));
        isTrue = true;
      } catch (err) {
        isTrue = false;
      }
    }
    return isTrue;
  }

  async generateReferralImage(data: any): Promise<any> {
    try{
      var Templates_ = new Templates();
      Templates_ = await this.getTemplate('REFERRAL', 'REFERRAL');
      var html_body = Templates_.body_detail.trim().toString();
      const $_ = cheerio.load(html_body);
      var dataimage = null;
      if (data.image_profile != '') {
        dataimage = await this.seaweedfsService.read(data.image_profile.replace('/localrepo', ''));
      }else{
        dataimage = fs.readFileSync('./profile-default.jpg');
      }
      var data_string = 'data:image/png;base64,'+dataimage.toString('base64');
      $_('#profile').attr('src',data_string);
      $_('#fullname').text(data.fullName);
      $_('#username').text(data.username);
      $_('#qrcode').attr('src', await this.generateQRCode(data.refCode));
      var string_html = $_.html().toString();
      const images = await nodeHtmlToImage({
        html: string_html,
        quality:80
      });
      return images;
    }catch(e){
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed failed generate Image QR '+e,
        );
    }
  }

  async generateQRCode(Url: string): Promise<any> {
    const generateQR = await QRCode.toDataURL(Url, {
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 0.3,
      margin: 0,
       })
    return generateQR;
  }

  async getversion(): Promise<string>{
    var get_version = await this.settingsService.findOneByJenis('AppsVersion');
    var version_number = '';
    if (await this.ceckData(get_version)) {
      if (get_version.value != undefined) { version_number = get_version.value.toString(); }
    }
    return version_number;
  }

  async generateProfile(email: string,datafor:string): Promise<ProfileDTO> {
    var get_userbasic = await this.userbasicsService.findOne(email);
    var get_userauth = await this.userauthsService.findOne(email);

    var get_languages = null;
    var get_insight = null;
    var get_cities = null;
    var get_countries = null;
    var get_states = null;
    var get_profilePict = null;

    if (await this.ceckData(get_userbasic)) {

      if (get_userbasic.languages != undefined) {
        var languages_json = JSON.parse(JSON.stringify(get_userbasic.languages));
        get_languages = await this.languagesService.findOne(languages_json.$id);
      } 
      
      if (get_userbasic.insight != undefined) {
        var insight_json = JSON.parse(JSON.stringify(get_userbasic.insight));
        get_insight = await this.insightsService.findOne(insight_json.$id);
      }

      if (get_userbasic.countries != undefined) {
        var countries_json = JSON.parse(JSON.stringify(get_userbasic.countries));
        get_countries = await this.countriesService.findOne(countries_json.$id);
      }

      if (get_userbasic.cities != undefined) {
        var cities_json = JSON.parse(JSON.stringify(get_userbasic.cities));
        get_cities = await this.citiesService.findOne(cities_json.$id);
      }

      if (get_userbasic.states != undefined) {
        var states_json = JSON.parse(JSON.stringify(get_userbasic.states));
        get_states = await this.areasService.findOneid(states_json.$id);
      }

      if (get_userbasic.profilePict != null) {
        var mediaprofilepicts_json = JSON.parse(JSON.stringify(get_userbasic.profilePict));
        get_profilePict = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
      }
    }

    var AvatarDTO_ = new AvatarDTO();

    if (await this.ceckData(get_profilePict)) {
      AvatarDTO_.mediaBasePath = get_profilePict.mediaBasePath;
      AvatarDTO_.mediaUri = get_profilePict.mediaUri;
      AvatarDTO_.mediaType = get_profilePict.mediaType;
      AvatarDTO_.mediaEndpoint = '/profilepict/' + get_profilePict.mediaUri.replace('_0001.jpeg', '');
    }

    var CreateInsightsDto_ = new CreateInsightsDto();
    if (await this.ceckData(get_insight)) {
      if (get_insight.shares != undefined) { CreateInsightsDto_.shares = get_insight.shares; }
      if (get_insight.followers != undefined) { CreateInsightsDto_.followers = get_insight.followers; }
      if (get_insight.shares != undefined) { CreateInsightsDto_.shares = get_insight.shares; }
      if (get_insight.followings != undefined) { CreateInsightsDto_.followings = get_insight.followings; }
      if (get_insight.reactions != undefined) { CreateInsightsDto_.reactions = get_insight.reactions; }
      if (get_insight.posts != undefined) { CreateInsightsDto_.followers = get_insight.posts; }
      if (get_insight.views != undefined) { CreateInsightsDto_.views = get_insight.views; }
      if (get_insight.likes != undefined) { CreateInsightsDto_.likes = get_insight.likes; }
    }

    var interests_array = [];
    if (get_userbasic.userInterests.length > 0) {
      for (let i = 0; i < get_userbasic.userInterests.length; i++) {
        if (get_userbasic.userInterests[i] != null) {
          var interests_json = JSON.parse(
            JSON.stringify(get_userbasic.userInterests[i]),
          );
          if (interests_json.ref == 'interests_repo') {
            const interests = await this.interestsRepoService.findOne(
              interests_json.$id,
            );
            interests_array[i] = interests.interestName;
          } else {
            const interests = await this.interestsService.findOne(
              interests_json.$id,
            );
            interests_array[i] = interests.interestName;
          }
        }
      }
    }

    var ProfileDTO_ = new ProfileDTO();
    if (datafor == 'FULL') {
      if (get_userbasic.profileID != undefined) { ProfileDTO_.profileID = get_userbasic.profileID; }
      if (get_userauth.regSrc != undefined) { ProfileDTO_.regSrc = get_userauth.regSrc; }
      if (get_userbasic.bio != undefined) { ProfileDTO_.bio = get_userbasic.bio; } 
      if (get_userbasic.dob != undefined) { ProfileDTO_.dob = get_userbasic.dob; }
      if (get_userbasic.gender != undefined) { ProfileDTO_.gender = get_userbasic.gender; }
      if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }

      if (get_cities != null) { ProfileDTO_.city = get_cities.cityName; }
      if (get_states != null) { ProfileDTO_.area = get_states.stateName; }
      ProfileDTO_.mobileNumber = get_userbasic.mobileNumber;
      if (get_languages != null) {
        var eula = await this.eulasService.findOnelangiso(get_languages.langIso);
        if (await this.ceckData(eula)) {
          ProfileDTO_.eulaID = eula.eulaID;
        }
      }

      ProfileDTO_.isCelebrity = get_userbasic.isCelebrity.toString();
      ProfileDTO_.isPrivate = get_userbasic.isPrivate.toString();
      ProfileDTO_.isFollowPrivate = get_userbasic.isFollowPrivate.toString();
      ProfileDTO_.isPostPrivate = get_userbasic.isPostPrivate.toString();
      ProfileDTO_.otp = get_userauth.oneTimePassword;
      ProfileDTO_.otpToken = get_userauth.otpToken;
      ProfileDTO_.otpToken = get_userauth.otpToken;
      ProfileDTO_.authEmail = get_userauth.email;
      //ProfileDTO_.token =
      //ProfileDTO_.refreshToken =
      //ProfileDTO_.userProfile =
      //ProfileDTO_.socmedSource =
      //ProfileDTO_.referral =
      //ProfileDTO_.imei = 
      //ProfileDTO_.referralCount =
      //ProfileDTO_.children = 
    }

    if (datafor == 'LOGIN' || datafor == 'FULL' || datafor == 'PROFILE') {
      if (get_countries != null) { ProfileDTO_.country = get_countries.country; }
      if (get_userbasic.idProofNumber != undefined) { ProfileDTO_.idProofNumber = get_userbasic.idProofNumber; }
      ProfileDTO_.roles = get_userauth.roles;
      if (get_userbasic.fullName != undefined) { ProfileDTO_.fullName = get_userbasic.fullName; }
      if (await this.ceckData(get_profilePict)) {
        ProfileDTO_.avatar = AvatarDTO_;
      }
      ProfileDTO_.isIdVerified = get_userbasic.isIdVerified.toString();
      ProfileDTO_.isEmailVerified = get_userauth.isEmailVerified.toString();
      if (get_userbasic.idProofStatus != undefined) { ProfileDTO_.idProofStatus = get_userbasic.idProofStatus; }
      ProfileDTO_.insight = CreateInsightsDto_;
      if (get_languages != null) { ProfileDTO_.langIso = get_languages.langIso; }
      ProfileDTO_.interest = interests_array;
      ProfileDTO_.event = get_userbasic.event;
      if (get_userbasic.email != undefined) { ProfileDTO_.email = get_userbasic.email; }
      if (get_userauth.username != undefined) { ProfileDTO_.username = get_userauth.username; }
      ProfileDTO_.isComplete = get_userbasic.isComplete.toString();
      ProfileDTO_.status = get_userbasic.status;
    } 

    return ProfileDTO_;
  }
}
