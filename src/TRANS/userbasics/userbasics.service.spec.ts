import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicsService } from './userbasics.service';

describe('UserbasicsService', () => {
  let service: UserbasicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserbasicsService],
    }).compile();

    service = module.get<UserbasicsService>(UserbasicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
