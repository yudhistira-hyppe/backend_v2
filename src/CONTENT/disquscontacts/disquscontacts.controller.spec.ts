import { Test, TestingModule } from '@nestjs/testing';
import { DisquscontactsController } from './disquscontacts.controller';

describe('DisquscontactsController', () => {
  let controller: DisquscontactsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisquscontactsController],
    }).compile();

    controller = module.get<DisquscontactsController>(DisquscontactsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
