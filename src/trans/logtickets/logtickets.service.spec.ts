import { Test, TestingModule } from '@nestjs/testing';
import { LogticketsService } from './logtickets.service';

describe('LogticketsService', () => {
  let service: LogticketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogticketsService],
    }).compile();

    service = module.get<LogticketsService>(LogticketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
