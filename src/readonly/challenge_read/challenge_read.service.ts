import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { ChallengeRead, ChallengeReadDocument } from './schema/challenge_read.schema';

@Injectable()
export class ChallengeReadService {
  constructor(
    @InjectModel(ChallengeRead.name, 'SERVER_FULL_READ')
    private readonly challengeReadModel: Model<ChallengeReadDocument>,
  ) { }
}
