import { Test, TestingModule } from '@nestjs/testing';
import { SourceticketsService } from './sourcetickets.service';

describe('SourceticketsService', () => {
  let service: SourceticketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourceticketsService],
    }).compile();

    service = module.get<SourceticketsService>(SourceticketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
