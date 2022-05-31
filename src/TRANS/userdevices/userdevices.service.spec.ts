import { Test, TestingModule } from '@nestjs/testing';
import { UserdevicesService } from './userdevices.service';

describe('UserdevicesService', () => {
  let service: UserdevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserdevicesService],
    }).compile();

    service = module.get<UserdevicesService>(UserdevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
