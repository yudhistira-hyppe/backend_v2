import { Test, TestingModule } from '@nestjs/testing';
import { DeepArService } from './deepar.service';

describe('DeepArService', () => {
  let service: DeepArService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeepArService],
    }).compile();

    service = module.get<DeepArService>(DeepArService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
