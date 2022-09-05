import { Test, TestingModule } from '@nestjs/testing';
import { CategoryticketsService } from './categorytickets.service';

describe('CategoryticketsService', () => {
  let service: CategoryticketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryticketsService],
    }).compile();

    service = module.get<CategoryticketsService>(CategoryticketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
