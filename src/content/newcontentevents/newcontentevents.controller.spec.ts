import { Test, TestingModule } from '@nestjs/testing';
import { NewcontenteventsController } from './newcontentevents.controller';

describe('NewcontenteventsController', () => {
  let controller: NewcontenteventsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewcontenteventsController],
    }).compile();

    controller = module.get<NewcontenteventsController>(NewcontenteventsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
