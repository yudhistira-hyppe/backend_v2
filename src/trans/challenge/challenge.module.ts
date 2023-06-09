import { Module } from '@nestjs/common';
import { subChallengeService } from './subChallenge.service';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { OssModule } from 'src/stream/oss/oss.module';
import { UtilsModule } from 'src/utils/utils.module';
import { BadgeModule } from '../badge/badge.module';
import { subChallenge, subChallengeSchema } from './schemas/subchallenge.schema';

@Module({
  imports:[
    ConfigModule.forRoot(), 
    OssModule,
    UtilsModule,
    BadgeModule,
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }, { name: subChallenge.name, schema: subChallengeSchema }], 'SERVER_FULL')
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService, subChallengeService],
  exports: [ChallengeService, subChallengeService],
})
export class ChallengeModule {}
