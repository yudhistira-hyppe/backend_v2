import { Controller, Request, Post,Get, UseGuards, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import { JwtrefreshtokenService } from 'src/TRANS/jwtrefreshtoken/jwtrefreshtoken.service';

@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('api/user/login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Request() req) {
    return this.authService.login(req.user);
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
  async logout(@Body('email') email: string, @Req() request: any) {
    await this.jwtrefreshtokenService.removeRefreshToken(email);
    request.res.setHeader(
      'Set-Cookie',
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    );
    return {
      response_code: 202,
      messages: {
        info: ['Logout successful'],
      },
    };
  }
}