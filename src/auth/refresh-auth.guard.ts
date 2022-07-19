import { Injectable, NotAcceptableException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh-token') {
  handleRequest(err: any, user: any) {
    if (!user && err == null) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    if (err != null) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed, ' + err.response],
        },
      });
    }
    return user;
  }
}
