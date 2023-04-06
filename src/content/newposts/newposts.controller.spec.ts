import { Test, TestingModule } from '@nestjs/testing';
import { NewpostsController } from './newposts.controller';

describe('NewpostsController', () => {
  let controller: NewpostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewpostsController],
    }).compile();

    controller = module.get<NewpostsController>(NewpostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
