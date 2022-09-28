import { Test, TestingModule } from '@nestjs/testing';
import { LogapsarasService } from './logapsaras.service';

describe('LogapsarasService', () => {
  let service: LogapsarasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogapsarasService],
    }).compile();

    service = module.get<LogapsarasService>(LogapsarasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
