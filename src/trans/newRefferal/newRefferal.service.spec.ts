import { Test, TestingModule } from '@nestjs/testing';
import { NewRefferalService } from './newRefferal.service';

describe('NewRefferalService', () => {
  let service: NewRefferalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewRefferalService],
    }).compile();

    service = module.get<NewRefferalService>(NewRefferalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
