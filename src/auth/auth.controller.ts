import { Controller, Request, Post,Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
@Controller()
export class AuthController {
  
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('api/auth/login')
    async login(@Request() req) {
    return this.authService.login(req.user);
  }

  // @UseGuards(AuthGuard('jwt-refresh-token'))
  // @Post('api/auth/refreshtoken')
  // async refreshToken(@Request() req){
  //   return await this.authService.login(req.user);
  // }
}