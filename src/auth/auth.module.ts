import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserauthsModule } from '../trans/userauths/userauths.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './refresh.strategy';
import { UserbasicsModule } from '../trans/userbasics/userbasics.module';
import { UserdevicesModule } from '../trans/userdevices/userdevices.module';
import { JwtrefreshtokenModule } from '../trans/jwtrefreshtoken/jwtrefreshtoken.module';
import { CountriesModule } from '../infra/countries/countries.module';
import { LanguagesModule } from '../infra/languages/languages.module';
import { MediaprofilepictsModule } from '../content/mediaprofilepicts/mediaprofilepicts.module';
import { MediaproofpictsModule } from '../content/mediaproofpicts/mediaproofpicts.module';
import { InsightsModule } from '../content/insights/insights.module';
import { InterestsModule } from '../infra/interests/interests.module';
import { InterestsRepoModule } from '../infra/interests_repo/interests_repo.module';
import { ActivityeventsModule } from '../trans/activityevents/activityevents.module';
import { UtilsModule } from '../utils/utils.module';
import { AreasModule } from '../infra/areas/areas.module';
import { CitiesModule } from '../infra/cities/cities.module';
import { ReferralModule } from '../trans/referral/referral.module';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { SeaweedfsModule } from '../stream/seaweedfs/seaweedfs.module';
import { PostsModule } from '../content/posts/posts.module';
import { SettingsModule } from '../trans/settings/settings.module';
import { ContenteventsModule } from '../content/contentevents/contentevents.module';
import { AdsUserCompareModule } from '../trans/ads/adsusercompare/adsusercompare.module';
import { UserbasicsnewModule } from '../trans/newuserbasic/userbasicsnew.module';
import { OtpService } from './otp.service';
import { SocmedService } from './socmed.service';
import { GroupModule } from '../trans/usermanagement/group/group.module';
import { UserticketsModule } from '../trans/usertickets/usertickets.module';
import { UserticketdetailsModule } from '../trans/usertickets/userticketdetails/userticketdetails.module';
@Module({
  imports: [
    GroupModule,
    UserticketdetailsModule,
    MediaproofpictsModule,
    UserbasicsnewModule,
    AdsUserCompareModule,
    ContenteventsModule,
    SettingsModule,
    PostsModule,
    NestjsFormDataModule,
    UserauthsModule,
    UserbasicsModule,
    UserdevicesModule,
    JwtrefreshtokenModule,
    PassportModule,
    CountriesModule,
    LanguagesModule,
    MediaprofilepictsModule,
    InsightsModule,
    InterestsModule,
    InterestsRepoModule,
    UtilsModule,
    SeaweedfsModule,
    AreasModule,
    CitiesModule,
    ReferralModule,
    PostsModule,
    UserticketsModule,
    ActivityeventsModule, JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy, OtpService, SocmedService],
})
export class AuthModule { }
