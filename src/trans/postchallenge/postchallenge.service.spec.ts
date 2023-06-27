import { Test, TestingModule } from '@nestjs/testing';
import { PostchallengeService } from './postchallenge.service';

describe('PostchallengeService', () => {
  let service: PostchallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostchallengeService],
    }).compile();

    service = module.get<PostchallengeService>(PostchallengeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
