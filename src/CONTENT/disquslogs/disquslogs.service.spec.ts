import { Test, TestingModule } from '@nestjs/testing';
import { DisquslogsService } from './disquslogs.service';

describe('DisquslogsService', () => {
  let service: DisquslogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisquslogsService],
    }).compile();

    service = module.get<DisquslogsService>(DisquslogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
