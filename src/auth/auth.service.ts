import { Injectable } from '@nestjs/common';
import { UserauthsService } from '../TRANS/userauths/userauths.service';
import { UserbasicsService } from '../TRANS/userbasics/userbasics.service';
import { UserdevicesService } from '../TRANS/userdevices/userdevices.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {

    constructor(
      private userauthsService: UserauthsService,
      private jwtService: JwtService,
      private userbasicsService:UserbasicsService,
      private userdevicesService: UserdevicesService
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

    // async generateRefreshToken(userId):  Promise<string>{
    //   var refreshToken = randtoken.generate(16);
    //   var expirydate =new Date();
    //   expirydate.setDate(expirydate.getDate() + 6);
    //   //await this.usersService.saveorupdateRefreshToke(refreshToken, userId, expirydate);
    //   return refreshToken
    // }



    async login(user: any) {
      const location = user;
      const payload = { email: user.email, sub: user.userID };
      const datauserauthsService = await this.userauthsService.findOne(user._doc.email);
      const datauserbasicsService = await this.userbasicsService.findOne(user._doc.email);

      const messages = {
        "info":["Device activity logging successful"],
      };
      const data = {
        "idProofNumber":datauserbasicsService.idProofNumber,
        "roles":datauserauthsService.roles,
        "fullName":datauserbasicsService.fullName,
        "avatar":datauserbasicsService.profilePict,
        "isIdVerified":datauserbasicsService.isIdVerified,
        "isEmailVerified":datauserauthsService.isEmailVerified,
        "token":"Bearer "+ this.jwtService.sign(payload),
        "idProofStatus":datauserbasicsService.idProofStatus,
        "email":datauserbasicsService.email,
        "username":datauserauthsService.username
      };
      return {
        response_code: 202,
        data,
        messages,
        location
      };
    }
}
