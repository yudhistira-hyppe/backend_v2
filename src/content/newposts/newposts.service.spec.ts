import { Test, TestingModule } from '@nestjs/testing';
import { NewpostsService } from './newposts.service';

describe('NewpostsService', () => {
  let service: NewpostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewpostsService],
    }).compile();

    service = module.get<NewpostsService>(NewpostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
