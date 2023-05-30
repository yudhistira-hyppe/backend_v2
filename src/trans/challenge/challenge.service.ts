import { Injectable } from '@nestjs/common';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { Challenge } from './schemas/challenge.schema';

@Injectable()
export class ChallengeService {
  create(createChallenge: CreateChallengeDto) {
    return 'This action adds a new challenge';
  }

  findAll() {
    return `This action returns all challenge`;
  }

  findOne(id: string) {
    return `This action returns a #${id} challenge`;
  }

  update(id: string, createChallenge: CreateChallengeDto) {
    return `This action updates a #${id} challenge`;
  }

  remove(id: string) {
    return `This action removes a #${id} challenge`;
  }
}
