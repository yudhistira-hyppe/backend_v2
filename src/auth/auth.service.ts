import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../TRANS/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../TRANS/userauths/userauths.service';
import { UserbasicsService } from '../TRANS/userbasics/userbasics.service';
import { UserdevicesService } from '../TRANS/userdevices/userdevices.service';
import { CountriesService } from '../INFRA/countries/countries.service';
import { LanguagesService } from '../INFRA/languages/languages.service';
import { MediaprofilepictsService } from '../CONTENT/mediaprofilepicts/mediaprofilepicts.service';
import { InsightsService } from '../CONTENT/insights/insights.service';
import { InterestsService } from '../INFRA/interests/interests.service';
import { InterestsRepoService } from '../INFRA/interests_repo/interests_repo.service';
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
  ) {}

  async validateUser(
    email: string,
    pass: string,
    deviceId: string,
  ): Promise<any> {
    const user = await this.userauthsService.findOne(email);
    const userdevice = await this.userdevicesService.findOne(email, deviceId);

    const passuser = user.password;
    const deviceIds = userdevice.deviceID;
    const isMatch = await bcrypt.compare(pass, passuser);
    if (
      user &&
      user.email === email &&
      userdevice.deviceID === deviceIds &&
      isMatch
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const datauserauthsService = await this.userauthsService.findOne(
      user._doc.email,
    );
    const datauserbasicsService = await this.userbasicsService.findOne(
      user._doc.email,
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
      await this.generateToken(user._doc.email, user._doc._id)
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
      refreshToken: await this.generateRefreshToken(user._doc.email),
    };
    return {
      response_code: 202,
      data,
      messages,
    };
  }

  async refreshToken(email: string, refresh_token_id: string) {
    
    const datajwtrefreshtokenService = await this.jwtrefreshtokenService.findByEmailRefreshToken(
        email,
        refresh_token_id,
      );
    
    const datauserbasicsService = await this.userbasicsService.findOne(
        email
      );
            //console.log(datauserbasicsService._id.toString());
      if (datajwtrefreshtokenService) {
          var date_now = new Date();
          var date_exp = datajwtrefreshtokenService.exp;
          if (Number(date_exp) < new Date().valueOf() / 1000) {
            console.log('EXPIRED');
            throw new UnauthorizedException('Unabled to proceed'); 
          }else{
            var Token =
              'Bearer ' +
              (await this.generateToken(
                datauserbasicsService.email.toString(),
                datauserbasicsService._id.toString(),
              ));
            var RefreshToken =
              (await this.generateRefreshToken(
                datauserbasicsService.email.toString()
              ));
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

      }else{
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
}
