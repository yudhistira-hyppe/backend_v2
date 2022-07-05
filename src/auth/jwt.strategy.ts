import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private userdevicesService: UserdevicesService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (Request: any) => {
          if (Request.headers['x-auth-token'] != undefined) {
            return Request.headers['x-auth-token'].replace('Bearer ', '');
          }
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: any) {
    //Ceck User Userdevices
    const user_userdevicesService =
      await this.userdevicesService.findOneEmail(
        payload.email,
        payload.deviceId,
      );

    if (user_userdevicesService != null) {
      return { userID: payload.sub, email: payload.email };
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed '],
        },
      });
    }
  }
}