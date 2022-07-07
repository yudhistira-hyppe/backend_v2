import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { TemplatesService } from '../infra/templates/templates.service';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer'; 
import { Templates } from '../infra/templates/schemas/templates.schema';
import * as admin from 'firebase-admin';
import QR from 'qrcode-base64'

@Injectable()
export class UtilsService {
  constructor(
    private userauthsService: UserauthsService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private templatesService: TemplatesService,
  ) {}

  async sendEmail(
    to: string,
    from: string,
    subject: string,
    html: string,
  ): Promise<boolean> {
    var sendEmail_ = false;
    await this.mailerService
      .sendMail({
        to: to,
        from: from,
        subject: subject,
        html: html,
      })
      .then((success) => {
        sendEmail_ = true;
        console.log(success);
      })
      .catch((err) => {
        sendEmail_ = false;
        console.log(err);
      });
    return sendEmail_;
  }

  async sendFcm(fcmtoken:string,payload:any){
    await admin.messaging().sendToDevice(fcmtoken, payload);
  }

  async getTemplate(type: string, category: string): Promise<Templates> {
    return await this.templatesService.findOneByTypeAndCategory(type, category);
  }

  async ceckUserByEmail(email: string): Promise<boolean> {
    var existing = false;
    var user_auth = await this.userauthsService.findOne(email);
    if (await this.ceckData(user_auth)) {
      existing = true;
    }
    return existing;
  }

  async comparePassword(
    password_request: string,
    password_existing: string,
  ): Promise<boolean> {
    var isMatch = false;
    isMatch = await bcrypt.compare(password_request, password_existing);
    return isMatch;
  }

  async OTPExpires(otpRequestTime: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpRequestTime) {
      isTrue = true;
    }
    return isTrue;
  }

  async OTPNextAttempExpires(otpNextAttemptAllow: number): Promise<boolean> {
    var isTrue = false;
    if (new Date().getTime() > otpNextAttemptAllow) {
      isTrue = true;
    }
    return isTrue;
  }

  async compareOTPAttemp(otpattemp: number): Promise<boolean> {
    var isTrue = false;
    if (otpattemp < Number(process.env.OTP_ATTEMP_MAX)) {
      isTrue = true;
    }
    return isTrue;
  }

  async generateId(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var IdGenarate = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return IdGenarate;
  }

  async isAuthVerified(Data:any): Promise<boolean> {
    var isTrue = false;
    if(Data.isEmailVerified){
      if(!(Data.status=='NOTIFY')||!(Data.status=='INITIAL')){
        isTrue = true;
      }
    }
    return isTrue;
  }

  async ceckData(data: any): Promise<boolean> {
    var ceckdata = false;
    if (data != null) {
      if (data != undefined) {
        if (data.constructor.name === 'Array') {
          if (data.length > 0) {
            ceckdata = true;
          }
        } else if (data.constructor.name === 'Object') {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        } else {
          if (Object.keys(data).length > 0) {
            ceckdata = true;
          }
        }
      }
    }
    return ceckdata;
  }

  async generateOTP(): Promise<String> {
    var result = '';
    for (var i = 0; i < Number(process.env.OTP_LEGHT); i++) {
      result += Math.floor(Math.random() * 9);
    }
    return result;
  }

  async generateOTPExpires(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_EXPIRATION_TIME),
    );
    return curent_date.getTime();
  }

  async generateOTPExpiresNextAttemptAllow(): Promise<Number> {
    var curent_date = new Date();
    curent_date.setMinutes(
      curent_date.getMinutes() + Number(process.env.OTP_NEXT_ALLOW_MINUTE),
    );
    return curent_date.getTime();
  }

  async generateToken(email: string, deviceId: string) {
    const payload = {
      email: email,
      deviceId: deviceId,
    };
    return await this.jwtService.sign(payload);
  }

  async generateRefreshToken(): Promise<string> {
    var d = new Date().getTime();
    var d2 =
      (typeof performance !== 'undefined' &&
        performance.now &&
        performance.now() * 1000) ||
      0;
    var refreshToken = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = Math.random() * 16;
        if (d > 0) {
          r = (d + r) % 16 | 0;
          d = Math.floor(d / 16);
        } else {
          r = (d2 + r) % 16 | 0;
          d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      },
    );
    return refreshToken;
  }

  async generatePassword(password: string): Promise<string> {
    return await bcrypt.hashSync(password, 5);
  }

  async generateUsername(email: string): Promise<string> {
    var username = email.substring(0, email.indexOf('@'));
    var list_username = await this.userauthsService.findOneUsername(username);
    if (await this.ceckData(list_username)) {
      username += '_'+this.generateOTP();
    }
    return username;
  }

  async validateUsername(username: string): Promise<boolean> {
    var isTrue = false;
    var list_username = await this.userauthsService.findOneUsername(username);
    if (!(await this.ceckData(list_username))) {
      isTrue = true;
    }
    return isTrue;
  }

  async getDateTimeString(): Promise<string> {
    var DateTime = new Date().toISOString().replace('T', ' ');
    return DateTime.substring(0, DateTime.lastIndexOf('.'));
  }

  async getDateTimeDate(): Promise<Date> {
    return new Date();
  }

  async validasiEmail(email: string): Promise<boolean> {
    var valid_email = false;
    var atps = email.indexOf('@');
    var dots = email.lastIndexOf('.');
    if (atps < 1 || dots < atps + 2 || dots + 2 >= email.length) {
      valid_email = false;
    } else {
      valid_email = true;
    }
    return valid_email;
  }

  async validasiTokenEmail(head: any): Promise<boolean> {
    var isTrue = false;
    var email = head['x-auth-user'];
    var token = ((head['x-auth-token']).split(" "))[1];
    var data = await this.jwtService.decode(token);
    if(data!=undefined){
      if(data['email']==email){
        isTrue = true;
      }
    }
    return isTrue;
  }

  async validasiTokenEmailParam(bearer_token: string,email: string): Promise<boolean> {
    var isTrue = false;
    var email = email;
    var token = bearer_token.split(" ")[1];
    var data = await this.jwtService.decode(token);
    if(data!=undefined){
      if(data['email']==email){
        isTrue = true;
      }
    }
    return isTrue;
  }

  async generateReferralImage(data: any): Promise<any> {
    var Templates_ = new Templates();
    Templates_ = await this.getTemplate('REFERRAL', 'REFERRAL');
    var html_body = Templates_.body_detail.toString();
    var doc = new DOMParser().parseFromString(html_body, "text/xml");

    var qrcode_ = QR.drawImg(data.refCode, {
      typeNumber: 4,
      errorCorrectLevel: 'M',
      size: 256
    });

    var fullname = doc.getElementById('#fullname').innerHTML =data.fullname;
    var username = doc.getElementById('#username').innerHTML =data.username;
    var qrcode = doc.getElementById('#qrcode').setAttribute("src", qrcode_);

    console.log();
    return '';
  }
}
