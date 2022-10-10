import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicsnewService } from './userbasicsnew.service';

describe('UserbasicsService', () => {
  let service: UserbasicsnewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserbasicsnewService],
    }).compile();

    service = module.get<UserbasicsnewService>(UserbasicsnewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
