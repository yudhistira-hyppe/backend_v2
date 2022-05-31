import { Test, TestingModule } from '@nestjs/testing';
import { DisqusService } from './disqus.service';

describe('DisqusService', () => {
  let service: DisqusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisqusService],
    }).compile();

    service = module.get<DisqusService>(DisqusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
