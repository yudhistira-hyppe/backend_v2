import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicnewService } from './userbasicnew.service';

describe('UserbasicnewService', () => {
  let service: UserbasicnewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserbasicnewService],
    }).compile();

    service = module.get<UserbasicnewService>(UserbasicnewService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
