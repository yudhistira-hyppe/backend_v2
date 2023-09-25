import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtrefreshtokenService } from './jwtrefreshtoken.service';
import { JwtrefreshtokenController } from './jwtrefreshtoken.controller';
import { ConfigModule } from '@nestjs/config';
import { Jwtrefreshtoken, JwtrefreshtokenSchema } from './schemas/jwtrefreshtoken.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserauthsModule } from '../userauths/userauths.module';
import { UserbasicnewModule } from '../userbasicnew/userbasicnew.module';

@Module({

  imports: [
    UserauthsModule,
    UserbasicsModule,
    ConfigModule.forRoot(), UserbasicnewModule,
    MongooseModule.forFeature([{ name: Jwtrefreshtoken.name, schema: JwtrefreshtokenSchema }], 'SERVER_FULL')
  ],
  controllers: [JwtrefreshtokenController],
  providers: [JwtrefreshtokenService],
  exports: [JwtrefreshtokenService],

})
export class JwtrefreshtokenModule { }
