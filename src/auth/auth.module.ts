import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserauthsModule } from '../TRANS/userauths/userauths.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { JwtRefreshStrategy } from './jwt.refresh.strategy';
import { UserbasicsModule } from '../TRANS/userbasics/userbasics.module';
import { UserdevicesModule } from '../TRANS/userdevices/userdevices.module';
import { JwtrefreshtokenModule } from '../TRANS/jwtrefreshtoken/jwtrefreshtoken.module';
import { CountriesModule } from '../INFRA/countries/countries.module';
import { LanguagesModule } from '../INFRA/languages/languages.module';
import { MediaprofilepictsModule } from '../CONTENT/mediaprofilepicts/mediaprofilepicts.module';
import { InsightsModule } from '../CONTENT/insights/insights.module';
import { InterestsModule } from '../INFRA/interests/interests.module';
@Module({
  imports: [UserauthsModule,UserbasicsModule,UserdevicesModule,JwtrefreshtokenModule,PassportModule,CountriesModule,LanguagesModule,MediaprofilepictsModule,InsightsModule,InterestsModule,JwtModule.register({
    secret: process.env.JWT_ACCESS_TOKEN_SECRET,
    signOptions: { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME },
  }),],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy,JwtRefreshStrategy]
})
export class AuthModule {}
