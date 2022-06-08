import { Test, TestingModule } from '@nestjs/testing';
import { UserticketsService } from './usertickets.service';

describe('UserticketsService', () => {
  let service: UserticketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserticketsService],
    }).compile();

    service = module.get<UserticketsService>(UserticketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
