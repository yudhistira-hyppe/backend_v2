import { Test, TestingModule } from '@nestjs/testing';
import { UserplaylistService } from './userplaylist.service';

describe('UserbasicsService', () => {
  let service: UserplaylistService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserplaylistService],
    }).compile();

    service = module.get<UserplaylistService>(UserplaylistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
