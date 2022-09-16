import { Test, TestingModule } from '@nestjs/testing';
import { RemovedreasonsService } from './removedreasons.service';

describe('RemovedreasonsService', () => {
  let service: RemovedreasonsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RemovedreasonsService],
    }).compile();

    service = module.get<RemovedreasonsService>(RemovedreasonsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
