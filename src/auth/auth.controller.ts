import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UtilsService } from '../utils/utils.service';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import fs, { createReadStream } from 'fs';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private utilsService: UtilsService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('api/user/login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Request() req) {
    return this.authService.login(req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/user/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('api/user/refreshtoken')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshToken(
    @Body('email') email: string,
    @Body('refreshToken') refreshToken: string,
  ) {
    return await this.authService.refreshToken(email, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/logout')
  @HttpCode(HttpStatus.ACCEPTED)
  async logout(@Req() request: any, @Headers() headers) {
    return await this.authService.logout(request, headers);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/deviceactivity')
  @HttpCode(HttpStatus.ACCEPTED)
  async deviceactivity(@Req() request: any, @Headers() headers) {
    return await this.authService.deviceactivity(request, headers);
  }

  @Post('api/user/recoverpassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async recoverpassword(@Req() request: any) {
    return await this.authService.recoverpassword(request);
  }

  @Post('api/user/changepassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async changepassword(@Req() request: any, @Headers() headers) {
    return await this.authService.changepassword(request, headers);
  }

  @Post('api/user/signup')
  @HttpCode(HttpStatus.ACCEPTED)
  async signup(@Req() request: any) {
    return await this.authService.signup(request);
  }

  @Post('api/user/verifyaccount')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyaccount(@Req() request: any) {
    return await this.authService.signup(request);
  }

  @Post('api/user/updateprofile')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateprofile(@Req() request: any, @Headers() headers) {
    return await this.authService.updateprofile(request,headers);
  }

  @Post('api/user/resendotp')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendotp(@Req() request: any) {
    return await this.authService.resendotp(request);
  }

  @Post('api/user/updatelang')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatelang(@Req() request: any, @Headers() headers) {
    return await this.authService.updatelang(request,headers);
  }

  @Post('api/user/referral-count')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_count(@Req() request: any, @Headers() headers) {
    return await this.authService.referralcount(request,headers);
  }

  @Post('api/user/referral')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral(@Req() request: any, @Headers() headers) {
    return await this.authService.referral(request,headers);
  }

  @Post('api/user/referral-qrcode')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_qrcode(@Req() request: any, @Headers() headers) {
    return await this.authService.referralqrcode(request,headers);
  }

  @Get('profilePict/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async profilePict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string) {
      //const data = await this.authService.profilePict(id,token,email)
      //const file = createReadStream(data);
     // console.log(file);
      //file.pipe(res);
      //fs.createReadStream().pipe(res);
      var data = await this.authService.profilePict(id,token,email);
var stream = require('stream');

// Initiate the source
var bufferStream = new stream.PassThrough();

// Write your buffer
bufferStream.end(Buffer.from(data));

// Pipe it to something else  (i.e. stdout)
// bufferStream.pipe(process.stdout)
//       var myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
//   frequency: 10,      // in milliseconds.
//   chunkSize: 2048     // in bytes.
// }); 
// myReadableStreamBuffer.put(data);

// With a buffer
    //   const buffer = Buffer.from(data);
    //   const file = createReadStream(buffer);
    //   file.on('error', function (error) {
    //     console.log(`error: ${error.message}`);
    // })

    // file.on('data', (chunk) => {
    //     console.log(chunk);
    // })
    // const file = createReadStream(await this.authService.profilePict(id,token,email));
    // file.on('error', function (error) {
    //     console.log(`error: ${error.message}`);
    // })

    // file.on('data', (chunk) => {
    //     console.log(chunk);
    // })
    //return await this.authService.profilePict(id,token,email);
  }
}