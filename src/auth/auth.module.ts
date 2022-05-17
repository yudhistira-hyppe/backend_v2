import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserauthsModule } from '../TRANS/userauths/userauths.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { UserbasicsModule } from '../TRANS/userbasics/userbasics.module';
import { UserdevicesModule } from '../TRANS/userdevices/userdevices.module';
@Module({
  imports: [UserauthsModule,UserbasicsModule,UserdevicesModule,PassportModule, JwtModule.register({
    secret: jwtConstants.secret,
    signOptions: { expiresIn: '60s' },
  }),],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy]
})
export class AuthModule {}
