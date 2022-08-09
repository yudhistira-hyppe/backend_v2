import { Test, TestingModule } from '@nestjs/testing';
import { AdstypesService } from './adstypes.service';

describe('AdstypesService', () => {
  let service: AdstypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdstypesService],
    }).compile();

    service = module.get<AdstypesService>(AdstypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
