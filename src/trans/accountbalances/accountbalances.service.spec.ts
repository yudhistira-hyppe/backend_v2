import { Test, TestingModule } from '@nestjs/testing';
import { AccountbalancesService } from './accountbalances.service';

describe('AccountbalancesService', () => {
  let service: AccountbalancesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountbalancesService],
    }).compile();

    service = module.get<AccountbalancesService>(AccountbalancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
