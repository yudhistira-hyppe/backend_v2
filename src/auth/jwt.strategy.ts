import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../TRANS/jwtrefreshtoken/jwtrefreshtoken.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private jwtrefreshtokenService: JwtrefreshtokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    var user = await this.jwtrefreshtokenService.findOne(payload.email);
    if (user.refresh_token_id==null) {
        throw new UnauthorizedException();
    }
    return { userID: payload.sub, email: payload.email };
  }
}