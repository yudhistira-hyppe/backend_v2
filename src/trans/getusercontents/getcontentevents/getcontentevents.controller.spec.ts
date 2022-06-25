import { Test, TestingModule } from '@nestjs/testing';
import { GetcontenteventsController } from './getcontentevents.controller';

describe('GetcontenteventsController', () => {
  let controller: GetcontenteventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetcontenteventsController],
    }).compile();

    controller = module.get<GetcontenteventsController>(GetcontenteventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
