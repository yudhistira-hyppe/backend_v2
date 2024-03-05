import { Test, TestingModule } from '@nestjs/testing';
import { MonetizationService } from './monetization.service';

describe('MonetizationService', () => {
  let service: MonetizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonetizationService],
    }).compile();

    service = module.get<MonetizationService>(MonetizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
