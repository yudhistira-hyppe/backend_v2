import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('api/user/recoverpassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async recoverpassword(@Req() request: any) {
    return await this.authService.recoverpassword(request);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/changepassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async changepassword(@Req() request: any) {
    return await this.authService.changepassword(request);
  }
}
