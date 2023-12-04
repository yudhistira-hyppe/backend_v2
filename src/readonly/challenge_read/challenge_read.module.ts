import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChallengeRead, ChallengeReadSchema } from './schema/challenge_read.schema';
import { SubChallengeRead, SubChallengeReadSchema } from './schema/subchallenge_read.schema';
import { ChallengeReadService } from './challenge_read.service';
import { ChallengeReadController } from './challenge_read.controller';
import { SubChallengeReadService } from './subChallenge_read.service';
import { UtilsModule } from 'src/utils/utils.module';
import { LogapisModule } from 'src/trans/logapis/logapis.module';

@Module({
  imports: [
    UtilsModule,
    LogapisModule,
    MongooseModule.forFeature([
      { name: ChallengeRead.name, schema: ChallengeReadSchema },
      { name: SubChallengeRead.name, schema: SubChallengeReadSchema },
    ], 'SERVER_FULL_READ')
  ],
  controllers: [ChallengeReadController],
  providers: [ChallengeReadService, SubChallengeReadService],
  exports: [ChallengeReadService, SubChallengeReadService],
})
export class ChallengeReadModule { }
