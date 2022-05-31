import { Test, TestingModule } from '@nestjs/testing';
import { CorevaluesService } from './corevalues.service';

describe('CorevaluesService', () => {
  let service: CorevaluesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorevaluesService],
    }).compile();

    service = module.get<CorevaluesService>(CorevaluesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
