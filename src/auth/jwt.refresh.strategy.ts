import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthService } from "./auth.service";
import { JwtrefreshtokenService } from "../trans/jwtrefreshtoken/jwtrefreshtoken.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(private jwtrefreshtokenService:JwtrefreshtokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET,
      passReqToCallback:true
    });
  }
 
  async validate(req,payload: any) {
    var user = await this.jwtrefreshtokenService.findOne(payload.email);
    if(!user){
        throw new UnauthorizedException();
    }
    if(req.body.refreshToken != (await user).refresh_token_id){
        throw new UnauthorizedException();
    }
    if( new Date() > new Date(((await user).exp).numberLong.toString())){
      throw new UnauthorizedException();
    }
    return { userID: payload.sub, email:payload.email};
    
  }
}