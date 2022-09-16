import { Test, TestingModule } from '@nestjs/testing';
import { ReportreasonsService } from './reportreasons.service';

describe('ReportreasonsService', () => {
  let service: ReportreasonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReportreasonsService],
    }).compile();

    service = module.get<ReportreasonsService>(ReportreasonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
