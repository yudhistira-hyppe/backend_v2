import { Test, TestingModule } from '@nestjs/testing';
import { DisquscontactsService } from './disquscontacts.service';

describe('DisquscontactsService', () => {
  let service: DisquscontactsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisquscontactsService],
    }).compile();

    service = module.get<DisquscontactsService>(DisquscontactsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
