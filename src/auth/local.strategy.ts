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
    var lang = "id";

    if (request_json['deviceId'] != undefined) {
      deviceId = request_json.deviceId;
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param deviceId is mandatory',
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

    if (request_json['lang'] != undefined) {
      lang = request_json['lang'] 
    }
    
    const user = await this.authService.validateUser(email, password);
    
    if (user == 'INVALIDCREDENTIALSLID') {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'Sorry, your password is incorrect. Please double-check your password.',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Maaf, kata sandi kamu salah. Silahkan Periksa kembali kata sandi kamu.',
        );
      }
    }
    if (user == 'NOTFOUND') {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'No users were found. Please check again.',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Tidak ada pengguna yang ditemukan. Silahkan cek kembali.',
        );
      }
    }
    if (user == 'UNABLEDTOPROCEED') {
      if (lang == "en") {
        await this.errorHandler.generateNotAcceptableException(
          'Unable to proceed',
        );
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Tidak dapat melanjutkan',
        );
      }
    }
    return user;
  }
}
