import { Test, TestingModule } from '@nestjs/testing';
import { InterestsRepoService } from './interests_repo.service';

describe('InterestsRepoService', () => {
  let service: InterestsRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterestsRepoService],
    }).compile();

    service = module.get<InterestsRepoService>(InterestsRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
