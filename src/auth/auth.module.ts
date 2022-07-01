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
import { InsightsModule } from '../content/insights/insights.module';
import { InterestsModule } from '../infra/interests/interests.module';
import { InterestsRepoModule } from '../infra/interests_repo/interests_repo.module';
import { ActivityeventsModule } from '../trans/activityevents/activityevents.module';
import { UtilsModule } from '../utils/utils.module';
import { AreasModule } from '../infra/areas/areas.module';
import { CitiesModule } from '../infra/cities/cities.module';
import { ReferralModule } from '../trans/referral/referral.module';
import { MediaModule } from '../stream/media/media.module';
@Module({
  imports: [
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
    AreasModule,
    CitiesModule,
    ReferralModule,
    MediaModule,
    ActivityeventsModule, JwtModule.register({
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
