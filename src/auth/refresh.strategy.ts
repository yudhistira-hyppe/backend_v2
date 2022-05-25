import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from 'passport-jwt'
import { AuthService } from "./auth.service";
import { JwtrefreshtokenService } from "../TRANS/jwtrefreshtoken/jwtrefreshtoken.service";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
    constructor(private jwtrefreshtokenService:JwtrefreshtokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }
 
  async validate(req,payload: any) {
    if (req.body.email == undefined) {
      throw new BadRequestException('Unabled to proceed');
    } 
    if (req.body.refreshToken == undefined) {
      throw new BadRequestException('Unabled to proceed');
    } 
    var user = await this.jwtrefreshtokenService.findOne(req.body.email);
    if(!user){
        throw new UnauthorizedException();
    }
    if(req.body.refreshToken != (await user.refresh_token_id)){
        throw new UnauthorizedException();
    }
    if (new Date().getTime() > Number(await user.exp)) {
      throw new UnauthorizedException('token expired');
    }
    return { userID: payload.sub, email:payload.email};
    
  }
}