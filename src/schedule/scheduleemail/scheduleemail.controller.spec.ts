import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleEmailController } from './scheduleemail.controller';

describe('ScheduleEmailController', () => {
  let controller: ScheduleEmailController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleEmailController],
    }).compile();

    controller = module.get<ScheduleEmailController>(ScheduleEmailController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
