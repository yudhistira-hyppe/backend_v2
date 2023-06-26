import { Test, TestingModule } from '@nestjs/testing';
import { UserbadgeService } from './userbadge.service';

describe('UserbadgeService', () => {
  let service: UserbadgeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserbadgeService],
    }).compile();

    service = module.get<UserbadgeService>(UserbadgeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
