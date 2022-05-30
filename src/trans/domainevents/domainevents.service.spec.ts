import { Test, TestingModule } from '@nestjs/testing';
import { DomaineventsService } from './domainevents.service';

describe('DomaineventsService', () => {
  let service: DomaineventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DomaineventsService],
    }).compile();

    service = module.get<DomaineventsService>(DomaineventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
