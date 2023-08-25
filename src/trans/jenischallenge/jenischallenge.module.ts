import { Module } from '@nestjs/common';
import { JenischallengeService } from './jenischallenge.service';
import { JenischallengeController } from './jenischallenge.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { jenisChallenge, jenisChallengeSchema } from './schemas/jenischallenge.schema';
import { LogapisModule } from '../logapis/logapis.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports:[
    UtilsModule,
    LogapisModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:jenisChallenge.name, schema: jenisChallengeSchema }], 'SERVER_FULL')
  ],
  controllers: [JenischallengeController],
  providers: [JenischallengeService],
  exports: [JenischallengeService]
})
export class JenischallengeModule {}
