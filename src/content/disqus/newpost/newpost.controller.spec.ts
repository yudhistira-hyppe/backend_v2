import { Test, TestingModule } from '@nestjs/testing';
import { NewpostController } from './newpost.controller';

describe('NewpostController', () => {
  let controller: NewpostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewpostController],
    }).compile();

    controller = module.get<NewpostController>(NewpostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
