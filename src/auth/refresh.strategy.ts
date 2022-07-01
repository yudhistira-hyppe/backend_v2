import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotAcceptableException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(private jwtrefreshtokenService: JwtrefreshtokenService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (Request: any) => {
          // const decodedJwt = this.jwtService.decode(
          //   Request.rawHeaders[1].replace('Bearer ', ''),
          // );
          if (Request.rawHeaders[0] == 'x-auth-token') {
            return Request.rawHeaders[1].replace('Bearer ', '');
          }
        },
      ]),
      //jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    if (req.body.email == undefined) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    if (req.body.refreshToken == undefined) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    } 
    try {
      var user = await this.jwtrefreshtokenService.findOne(req.body.email);
      if (!user) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed'],
          },
        });
      }
      if (req.body.refreshToken != (await user.refresh_token_id)) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Invalid refesh token'],
          },
        });
      }
      if (new Date().getTime() > Number(await user.exp)) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed'],
          },
        });
      }
    }catch(err){
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    return { userID: payload.sub, email: payload.email };
  }
}
