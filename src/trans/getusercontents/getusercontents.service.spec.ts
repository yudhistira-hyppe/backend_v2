import { Test, TestingModule } from '@nestjs/testing';
import { GetusercontentsService } from './getusercontents.service';

describe('GetusercontentsService', () => {
  let service: GetusercontentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetusercontentsService],
    }).compile();

    service = module.get<GetusercontentsService>(GetusercontentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
