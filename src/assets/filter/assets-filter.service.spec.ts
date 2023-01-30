import { Test, TestingModule } from '@nestjs/testing';
import { AssetsFilterService } from './assets-filter.service';

describe('AssetsFilterService', () => {
  let service: AssetsFilterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssetsFilterService],
    }).compile();

    service = module.get<AssetsFilterService>(AssetsFilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
