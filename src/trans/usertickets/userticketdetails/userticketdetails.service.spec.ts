import { Test, TestingModule } from '@nestjs/testing';
import { UserticketdetailsService } from './userticketdetails.service';

describe('UserticketdetailsService', () => {
  let service: UserticketdetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserticketdetailsService],
    }).compile();

    service = module.get<UserticketdetailsService>(UserticketdetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
