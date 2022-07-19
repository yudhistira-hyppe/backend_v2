import {
  Injectable,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { ErrorHandler } from '../utils/error.handler';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private errorHandler: ErrorHandler, 
    private jwtrefreshtokenService: JwtrefreshtokenService
    ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (Request: any) => {
          if (Request.headers['x-auth-token'] != undefined) {
            return Request.headers['x-auth-token'].replace('Bearer ', '');
          }
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
      passReqToCallback: true,
    });
  }

  async validate(req, payload: any) {
    if (req.body.email == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param email is mandatory',
      );
    }
    if (req.body.refreshToken == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param refreshToken is mandatory',
      );
    }
    try {
      var user = await this.jwtrefreshtokenService.findOne(req.body.email);
      if (!user) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Data user not found',
        );
      }
      if (req.body.refreshToken != (await user.refresh_token_id)) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Data refreshToken not found',
        );
      }
      if (new Date().getTime() > Number(await user.exp)) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Data refreshToken expired',
        );
      }
    } catch (err) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, ' + err,
      );
    }
    return { userID: payload.sub, email: payload.email };
  }
}
