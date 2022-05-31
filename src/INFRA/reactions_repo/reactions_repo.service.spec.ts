import { Test, TestingModule } from '@nestjs/testing';
import { ReactionsRepoService } from './reactions_repo.service';

describe('ReactionsRepoService', () => {
  let service: ReactionsRepoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReactionsRepoService],
    }).compile();

    service = module.get<ReactionsRepoService>(ReactionsRepoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
