import { Test, TestingModule } from '@nestjs/testing';
import { Pph21sService } from './pph21s.service';

describe('Pph21sService', () => {
  let service: Pph21sService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Pph21sService],
    }).compile();

    service = module.get<Pph21sService>(Pph21sService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
