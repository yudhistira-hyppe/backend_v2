import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ErrorHandler } from '../utils/error.handler';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private errorHandler: ErrorHandler,
  ) {
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

    if (request_json['deviceId'] != undefined) {
      deviceId = request_json.deviceId;
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (request_json['location'] != undefined) {
      if (request_json.location['latitude'] != undefined) {
        longitude = request_json.location.latitude;
      }
      if (request_json.location['latitude'] != undefined) {
        latitude = request_json.location.latitude;
      }
    }
    const user = await this.authService.validateUser(email, password);
    
    if (user == 'INVALIDCREDENTIALSLID') {
      await this.errorHandler.generateNotAcceptableException(
        'Invalid credentials',
      );
    }
    if (user == 'NOTFOUND') {
      await this.errorHandler.generateNotAcceptableException('User not found');
    }
    if (user == 'UNABLEDTOPROCEED') {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    return user;
  }
}
