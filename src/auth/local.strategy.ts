import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email', passReqToCallback: true });
  }

  async validate(
    request: Request,
    email: string,
    password: string,
  ): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var deviceId = null;
    var longitude = null;
    var latitude = null;

    if (request_json['deviceId'] !== undefined) {
      deviceId = request_json.deviceId;
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    if (request_json['location'] !== undefined) {
      if (request_json.location['latitude'] !== undefined) {
        longitude = request_json.location.latitude;
      }
      if (request_json.location['latitude'] !== undefined) {
        latitude = request_json.location.latitude;
      }
    }
    const user = await this.authService.validateUser(
      email,
      password,
      deviceId,
    );
    if (user == 406){
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Invalid credentials'],
        },
      });
    }
    if (!user) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['User not found'],
        },
      });
    }
    return user;
  }
}