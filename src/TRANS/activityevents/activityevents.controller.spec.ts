import { Test, TestingModule } from '@nestjs/testing';
import { ActivityeventsController } from './activityevents.controller';

describe('ActivityeventsController', () => {
  let controller: ActivityeventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityeventsController],
    }).compile();

    controller = module.get<ActivityeventsController>(ActivityeventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
