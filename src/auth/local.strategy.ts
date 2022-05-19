import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { json } from 'body-parser'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({  usernameField : "email", passReqToCallback: true });
  }

  async validate(request: Request,email: string, password: string): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var deviceId = null;
    var longitude = null;
    var latitude = null;
    if(request_json["deviceId"] !== undefined){
      deviceId = request_json.deviceId;
    }else{
      throw new BadRequestException("Unabled to proceed"); 
    }
    if(request_json["location"] !== undefined){
      if(request_json.location["latitude"] !== undefined){
        longitude = request_json.location.latitude;
      }else{
        throw new BadRequestException("Unabled to proceed"); 
      }
      if(request_json.location["latitude"] !== undefined){
        latitude = request_json.location.latitude;
      }else{
        throw new BadRequestException("Unabled to proceed"); 
      }
    }else{
      throw new BadRequestException("Unabled to proceed"); 
    }
    const user = await this.authService.validateUser(email, password, deviceId);
    if (!user) {
      throw new ForbiddenException('Access Denied');
    }
    return user;
  }
}