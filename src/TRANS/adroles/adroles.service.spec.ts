import { Test, TestingModule } from '@nestjs/testing';
import { AdrolesService } from './adroles.service';

describe('AdrolesService', () => {
  let service: AdrolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdrolesService],
    }).compile();

    service = module.get<AdrolesService>(AdrolesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
