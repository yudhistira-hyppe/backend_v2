import {
  Injectable,
  UnauthorizedException,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { CountriesService } from '../infra/countries/countries.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { InsightsService } from '../content/insights/insights.service';
import { InterestsService } from '../infra/interests/interests.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { CreateActivityeventsDto } from 'src/trans/activityevents/dto/create-activityevents.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { TokenExpiredError } from 'jsonwebtoken';

var randtoken = require('rand-token');

@Injectable()
export class AuthService {
  constructor(
    private userauthsService: UserauthsService,
    private jwtService: JwtService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private countriesService: CountriesService,
    private languagesService: LanguagesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private interestsService: InterestsService,
    private interestsRepoService: InterestsRepoService,
    private activityeventsService: ActivityeventsService,
  ) { }

  async validateUser(
    email: string,
    pass: string,
    deviceId: string,
  ): Promise<any> {
    const user = await this.userauthsService.findOne(email);
    const userdevice = await this.userdevicesService.findOneEmail(
      email,
      deviceId,
    );
    //function untuk temporary
    if (!userdevice) {
      var _class = 'nest.js.Userdevices';
      var data = new CreateUserdeviceDto();
      var _id = await this.generateId();
      var new_date = new Date().toISOString().replace('T', ' ');
      data._id = _id.toLowerCase();
      data.deviceID = deviceId;
      data.email = email;
      data.active = true;
      data.createdAt = new_date.substring(0, new_date.lastIndexOf('.'));
      data.updatedAt = new_date.substring(0, new_date.lastIndexOf('.'));
      data._class = _class;
      var data_insert = await this.userdevicesService.create(data);
    }
    //function untuk temporary
    if (!!user) {
      const passuser = user.password;
      const isMatch = await bcrypt.compare(pass, passuser);
      if (!isMatch) {
        return 406;
      }
      if (user && user.email === email && isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(req: any) {
    var user_email = req.body.email;
    var user_location = req.body.location;
    var user_deviceId = req.body.deviceId;

    //function untuk eventactivity
    var Status = 'INITIAL';
    var Event = 'LOGIN';
    const user_userbasics = await this.userbasicsService.findOne(user_email);
    const user_jwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
      user_email,
    );

    if (!!user_userbasics && !!user_jwtrefreshtoken) {
      // const user_activityevents = await this.activityeventsService
      //   .findParentByDevice(user_email, user_deviceId, Event, false);
      // var _class = 'nest.js.Userdevices';
      // var new_date = new Date().toISOString().replace('T', ' ');

      // console.log(user_activityevents);
      // if (!!user_activityevents) {
      //   var data_CreateActivityeventsDto = new CreateActivityeventsDto();
      //   data_CreateActivityeventsDto.activityEventID = await this.generateId();
      //   data_CreateActivityeventsDto.activityType = Event;
      //   data_CreateActivityeventsDto.active = true;
      //   data_CreateActivityeventsDto.status = 'USER_LOGOUT';
      //   data_CreateActivityeventsDto.target = 'COMPLETE';
      //   data_CreateActivityeventsDto.event = 'LOGOUT';
      //   data_CreateActivityeventsDto.event = 'LOGOUT';
      //   data_CreateActivityeventsDto.payload = {
      //     login_location: {
      //       latitude: user_location.latitude,
      //       longitude: user_location.longitude,
      //     },
      //     logout_date: null,
      //     login_date: new_date.substring(0, new_date.lastIndexOf('.')),
      //     login_device: user_deviceId,
      //     email: user_email,
      //   };
      //   data_CreateActivityeventsDto.payload.login_date = new_date.substring(
      //     0,
      //     new_date.lastIndexOf('.'),
      //   );
      //   // data_CreateActivityeventsDto.payload.login_device = user_deviceId;
      //   // data_CreateActivityeventsDto.payload.login_location.latitude =
      //   //   user_location.latitude;
      //   // data_CreateActivityeventsDto.payload.login_location.longitude =
      //   //   user_location.longitude;
      //   data_CreateActivityeventsDto.createdAt = new_date.substring(
      //     0,
      //     new_date.lastIndexOf('.'),
      //   );
      //   data_CreateActivityeventsDto.updatedAt = new_date.substring(
      //     0,
      //     new_date.lastIndexOf('.'),
      //   );
      //   data_CreateActivityeventsDto.sequenceNumber = '1';
      //   data_CreateActivityeventsDto.flowIsDone = false;
      //   data_CreateActivityeventsDto._class = _class;
      //   const user_activityevents = await this.activityeventsService.create(
      //     data_CreateActivityeventsDto,
      //   );
      // }else{
      //   const user_activityevents = await this.activityeventsService.update(
      //     {
      //       'payload.login_date': user_email,
      //       'payload.login_device': user_deviceId,
      //     },
      //     {
      //       'payload.login_date': new_date.substring(
      //         0,
      //         new_date.lastIndexOf('.'),
      //       ),
      //       updatedAt: new_date.substring(0, new_date.lastIndexOf('.')),
      //       'payload.login_location.latitude': user_location.latitude,
      //       'payload.login_location.longitude': user_location.longitude,
      //     },
      //   );
      // }
    }
    //function untuk eventactivity

    const datauserauthsService = await this.userauthsService.findOne(
      user_email,
    );
    const datauserbasicsService = await this.userbasicsService.findOne(
      user_email,
    );

    var countries_json = JSON.parse(
      JSON.stringify(datauserbasicsService.countries),
    );
    var languages_json = JSON.parse(
      JSON.stringify(datauserbasicsService.languages),
    );
    var mediaprofilepicts_json = JSON.parse(
      JSON.stringify(datauserbasicsService.profilePict),
    );
    var insights_json = JSON.parse(
      JSON.stringify(datauserbasicsService.insight),
    );

    var interests_array = [];
    if (datauserbasicsService.userInterests.length > 0) {
      for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
        var interests_json = JSON.parse(
          JSON.stringify(datauserbasicsService.userInterests[i]),
        );
        if (interests_json.$ref == 'interests_repo') {
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

    const countries = await this.countriesService.findOne(countries_json.$id);
    const languages = await this.languagesService.findOne(languages_json.$id);
    const mediaprofilepicts = await this.mediaprofilepictsService.findOne(
      mediaprofilepicts_json.$id,
    );
    const insights = await this.insightsService.findOne(insights_json.$id);

    var mediaUri = mediaprofilepicts.mediaUri;
    let result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
    var mediaprofilepicts_res = {
      mediaBasePath: mediaprofilepicts.mediaBasePath,
      mediaUri: mediaprofilepicts.mediaUri,
      mediaType: mediaprofilepicts.mediaType,
      mediaEndpoint: result,
    };

    var insights_res = {
      shares: insights.shares,
      followers: insights.followers,
      comments: insights.comments,
      followings: insights.followings,
      reactions: insights.reactions,
      posts: insights.posts,
      views: insights.views,
      likes: insights.likes,
    };

    const messages = {
      info: ['Device activity logging successful'],
    };
    var token = (
      await this.generateToken(user_email, req.user._doc._id)
    ).toString();
    const data = {
      country: countries.country,
      idProofNumber: datauserbasicsService.idProofNumber,
      roles: datauserauthsService.roles,
      fullName: datauserbasicsService.fullName,
      avatar: mediaprofilepicts_res,
      isIdVerified: datauserbasicsService.isIdVerified,
      isEmailVerified: datauserauthsService.isEmailVerified,
      token: 'Bearer ' + token,
      idProofStatus: datauserbasicsService.idProofStatus,
      insight: insights_res,
      langIso: languages.langIso,
      interest: interests_array,
      event: datauserbasicsService.event,
      email: datauserbasicsService.email,
      username: datauserauthsService.username,
      isComplete: datauserbasicsService.isComplete,
      status: datauserbasicsService.status,
      refreshToken: await this.generateRefreshToken(user_email),
    };
    return {
      response_code: 202,
      data,
      messages,
    };
  }

  async refreshToken(email: string, refresh_token_id: string) {
    const datajwtrefreshtokenService =
      await this.jwtrefreshtokenService.findByEmailRefreshToken(
        email,
        refresh_token_id,
      );

    const datauserbasicsService = await this.userbasicsService.findOne(email);
    if (datajwtrefreshtokenService) {
      var date_now = new Date();
      var date_exp = datajwtrefreshtokenService.exp;
      if (Number(date_exp) < new Date().valueOf() / 1000) {
        throw new UnauthorizedException('Unabled to proceed');
      } else {
        var Token =
          'Bearer ' +
          (await this.generateToken(
            datauserbasicsService.email.toString(),
            datauserbasicsService._id.toString(),
          ));
        var RefreshToken = await this.generateRefreshToken(
          datauserbasicsService.email.toString(),
        );
        return {
          response_code: 202,
          data: {
            token: Token.toString(),
            refreshToken: RefreshToken.toString(),
          },
          messages: {
            info: ['Refresh Token successful'],
          },
        };
      }
    } else {
      throw new UnauthorizedException('Unabled to proceed');
    }
  }

  async generateToken(email: string, userID: string) {
    const payload = { email: email, sub: userID.toString() };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(email: string): Promise<string> {
    //const decodedJwtAccessToken: any = this.jwtService.decode(token);
    var refreshToken =
      randtoken.generate(8) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(12);
    var iatdate = new Date();
    var expdate = new Date();
    expdate.setDate(expdate.getDate() + 6);
    await this.jwtrefreshtokenService.saveorupdateRefreshToken(
      refreshToken,
      email,
      expdate.getTime(),
      iatdate.getTime(),
    );
    return refreshToken;
  }

  async generateId(): Promise<string> {
    var _id =
      randtoken.generate(8) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(12);
    return _id;
  }
}
