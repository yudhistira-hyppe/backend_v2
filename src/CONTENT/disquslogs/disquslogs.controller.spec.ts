import { Test, TestingModule } from '@nestjs/testing';
import { DisquslogsController } from './disquslogs.controller';

describe('DisquslogsController', () => {
  let controller: DisquslogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisquslogsController],
    }).compile();

    controller = module.get<DisquslogsController>(DisquslogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
