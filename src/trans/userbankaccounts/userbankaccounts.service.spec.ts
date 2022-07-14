import { Test, TestingModule } from '@nestjs/testing';
import { UserbankaccountsService } from './userbankaccounts.service';

describe('UserbankaccountsService', () => {
  let service: UserbankaccountsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserbankaccountsService],
    }).compile();

    service = module.get<UserbankaccountsService>(UserbankaccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
