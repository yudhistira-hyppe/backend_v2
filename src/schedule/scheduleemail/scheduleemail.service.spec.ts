import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleEmailService } from './scheduleemail.service';

describe('ScheduleEmailService', () => {
  let service: ScheduleEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduleEmailService],
    }).compile();

    service = module.get<ScheduleEmailService>(ScheduleEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
