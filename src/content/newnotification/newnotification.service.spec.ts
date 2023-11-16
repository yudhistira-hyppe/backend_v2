import { Test, TestingModule } from '@nestjs/testing';
import { NewNotificationService } from './newnotification.service';

describe('NewnotificationService', () => {
  let service: NewNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewNotificationService],
    }).compile();

    service = module.get<NewNotificationService>(NewNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
