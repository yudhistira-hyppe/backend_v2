import { Test, TestingModule } from '@nestjs/testing';
import { ActivityeventsService } from './activityevents.service';

describe('ActivityeventsService', () => {
  let service: ActivityeventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivityeventsService],
    }).compile();

    service = module.get<ActivityeventsService>(ActivityeventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
