import { Test, TestingModule } from '@nestjs/testing';
import { UservouchersService } from './uservouchers.service';

describe('UservouchersService', () => {
  let service: UservouchersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UservouchersService],
    }).compile();

    service = module.get<UservouchersService>(UservouchersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
