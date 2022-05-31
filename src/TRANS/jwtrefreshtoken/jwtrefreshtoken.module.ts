import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtrefreshtokenService } from './jwtrefreshtoken.service';
import { JwtrefreshtokenController } from './jwtrefreshtoken.controller';
import { ConfigModule } from '@nestjs/config';
import { Jwtrefreshtoken, JwtrefreshtokenSchema } from './schemas/jwtrefreshtoken.schema';
import { UserbasicsModule } from '../userbasics/userbasics.module';
import { UserauthsModule } from '../userauths/userauths.module';

@Module({

  imports: [
    UserauthsModule,
    UserbasicsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Jwtrefreshtoken.name, schema: JwtrefreshtokenSchema }],'SERVER_TRANS')
],
controllers: [JwtrefreshtokenController],
providers: [JwtrefreshtokenService],
exports: [JwtrefreshtokenService],

})
export class JwtrefreshtokenModule {}
