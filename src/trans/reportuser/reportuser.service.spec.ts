import { Test, TestingModule } from '@nestjs/testing';
import { ReportuserService } from './reportuser.service';

describe('ReportsService', () => {
  let service: ReportuserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportuserService],
    }).compile();

    service = module.get<ReportuserService>(ReportuserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
