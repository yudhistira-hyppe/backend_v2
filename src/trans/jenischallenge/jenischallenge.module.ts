import { Module } from '@nestjs/common';
import { JenischallengeService } from './jenischallenge.service';
import { JenischallengeController } from './jenischallenge.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { jenisChallenge, jenisChallengeSchema } from './schemas/jenischallenge.schema';

@Module({
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:jenisChallenge.name, schema: jenisChallengeSchema }], 'SERVER_FULL')
  ],
  controllers: [JenischallengeController],
  providers: [JenischallengeService],
  exports: [JenischallengeService]
})
export class JenischallengeModule {}
