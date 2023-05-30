import { Test, TestingModule } from '@nestjs/testing';
import { UserchallengesService } from './userchallenges.service';

describe('UserchallengesService', () => {
  let service: UserchallengesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserchallengesService],
    }).compile();

    service = module.get<UserchallengesService>(UserchallengesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
