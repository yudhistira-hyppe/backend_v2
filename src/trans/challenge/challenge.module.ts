import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Challenge, ChallengeSchema } from './schemas/challenge.schema';
import { OssModule } from 'src/stream/oss/oss.module';
import { UtilsModule } from 'src/utils/utils.module';
import { BadgeModule } from '../badge/badge.module';

@Module({
  imports:[
    ConfigModule.forRoot(), 
    OssModule,
    UtilsModule,
    BadgeModule,
    MongooseModule.forFeature([{ name: Challenge.name, schema: ChallengeSchema }], 'SERVER_FULL')
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
