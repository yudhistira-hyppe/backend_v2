import { Test, TestingModule } from '@nestjs/testing';
import { LogapisService } from './logapis.service';

describe('LogapisService', () => {
  let service: LogapisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogapisService],
    }).compile();

    service = module.get<LogapisService>(LogapisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
