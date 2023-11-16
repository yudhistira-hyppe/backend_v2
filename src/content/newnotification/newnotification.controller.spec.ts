import { Test, TestingModule } from '@nestjs/testing';
import { NewNotificationController } from './newnotification.controller';
import { NewNotificationService } from './newnotification.service';

describe('NewnotificationController', () => {
  let controller: NewNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewNotificationController],
      providers: [NewNotificationService],
    }).compile();

    controller = module.get<NewNotificationController>(NewNotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
