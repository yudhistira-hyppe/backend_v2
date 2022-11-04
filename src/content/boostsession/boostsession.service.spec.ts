import { Test, TestingModule } from '@nestjs/testing';
import { BoostsessionService } from './boostsession.service';

describe('BoostsessionService', () => {
  let service: BoostsessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoostsessionService],
    }).compile();

    service = module.get<BoostsessionService>(BoostsessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
