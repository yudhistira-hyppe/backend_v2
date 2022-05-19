import { Test, TestingModule } from '@nestjs/testing';
import { EulasService } from './eulas.service';

describe('EulasService', () => {
  let service: EulasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EulasService],
    }).compile();

    service = module.get<EulasService>(EulasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
