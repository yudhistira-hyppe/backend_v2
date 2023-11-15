import { Test, TestingModule } from '@nestjs/testing';
import { NewdisqusService } from './newdisqus.service';

describe('NewdisqusService', () => {
  let service: NewdisqusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewdisqusService],
    }).compile();

    service = module.get<NewdisqusService>(NewdisqusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
