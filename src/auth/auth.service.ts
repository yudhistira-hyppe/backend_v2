import { Injectable } from '@nestjs/common';
import { JwtrefreshtokenService } from '../TRANS/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../TRANS/userauths/userauths.service';
import { UserbasicsService } from '../TRANS/userbasics/userbasics.service';
import { UserdevicesService } from '../TRANS/userdevices/userdevices.service';
import { CountriesService } from '../INFRA/countries/countries.service';
import { LanguagesService } from '../INFRA/languages/languages.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

var randtoken = require('rand-token');

@Injectable()
export class AuthService {

    constructor(
      private userauthsService: UserauthsService,
      private jwtService: JwtService,
      private userbasicsService:UserbasicsService,
      private userdevicesService: UserdevicesService,
      private jwtrefreshtokenService: JwtrefreshtokenService,
      private countriesService: CountriesService,
      private languagesService: LanguagesService
    ) {}

   
    async validateUser(email: string, pass: string,deviceId:string): Promise<any> {
      const user = await this.userauthsService.findOne(email);
      const userdevice = await this.userdevicesService.findOne(email,deviceId);
     // const saltOrRounds = 10;
    
      // const hash = await bcrypt.hash(passwords, saltOrRounds);
      const passuser=user.password;
      const deviceIds=userdevice.deviceID;
      const isMatch = await bcrypt.compare(pass, passuser);
      if (user && user.email === email && userdevice.deviceID === deviceIds && isMatch) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    }

    async generateRefreshToken(email):  Promise<string>{
      var refreshToken = randtoken.generate(16);
      var expirydate = new Date();
      expirydate.setDate(expirydate.getDate() + 6);
      await this.jwtrefreshtokenService.saveorupdateRefreshToken(refreshToken, email, expirydate);
      return refreshToken
    }



    async login(user: any) {
      const location = user;
      const payload = { email: user.email, sub: user.userID };
      const datauserauthsService = await this.userauthsService.findOne(user._doc.email);
      const datauserbasicsService = await this.userbasicsService.findOne(user._doc.email);
      
      var countries_json = JSON.parse(JSON.stringify(datauserbasicsService.countries));
      var languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
      
      const countries = await this.countriesService.findOne(countries_json.$id);
      const languages = await this.languagesService.findOne(languages_json.$id);

      //this.jwtrefreshtokenService.create()

      const messages = {
        "info":["Device activity logging successful"],
      };
      //console.log(request_json.$id);
      const data = {
        "country": countries.country,
        "idProofNumber":datauserbasicsService.idProofNumber,
        "roles":datauserauthsService.roles,
        "fullName":datauserbasicsService.fullName,
        "avatar":datauserbasicsService.profilePict,
        "isIdVerified":datauserbasicsService.isIdVerified,
        "isEmailVerified":datauserauthsService.isEmailVerified,
        "token":"Bearer "+ this.jwtService.sign(payload),
        "idProofStatus":datauserbasicsService.idProofStatus,
        "insight":[],
        "langIso": languages.langIso,
        "interest": [],
        "event": datauserbasicsService.event,
        "email": datauserbasicsService.email,
        "username": datauserauthsService.username,
        "isComplete": datauserbasicsService.isComplete,
        "status": datauserbasicsService.status,
        "refreshToken": ""
      };
      return {
        //refreshToken: await this.generateRefreshToken(user._doc.email),
        response_code: 202,
        data,
        messages
      };
    }
}
