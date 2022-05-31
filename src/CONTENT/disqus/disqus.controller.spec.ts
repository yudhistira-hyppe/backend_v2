import { Test, TestingModule } from '@nestjs/testing';
import { DisqusController } from './disqus.controller';

describe('DisqusController', () => {
  let controller: DisqusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisqusController],
    }).compile();

    controller = module.get<DisqusController>(DisqusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
