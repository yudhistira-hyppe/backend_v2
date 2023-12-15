import { Test, TestingModule } from '@nestjs/testing';
import { NewpostService } from './newpost.service';

describe('NewpostService', () => {
  let service: NewpostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewpostService],
    }).compile();

    service = module.get<NewpostService>(NewpostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
