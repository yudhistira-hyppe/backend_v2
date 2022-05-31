import { Test, TestingModule } from '@nestjs/testing';
import { UserauthsService } from './userauths.service';

describe('UserauthsService', () => {
  let service: UserauthsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserauthsService],
    }).compile();

    service = module.get<UserauthsService>(UserauthsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
