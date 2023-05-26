import { Test, TestingModule } from '@nestjs/testing';
import { JenischallengeService } from './jenischallenge.service';

describe('JenischallengeService', () => {
  let service: JenischallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JenischallengeService],
    }).compile();

    service = module.get<JenischallengeService>(JenischallengeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
