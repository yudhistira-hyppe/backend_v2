import { Test, TestingModule } from '@nestjs/testing';
import { NewdisqusController } from './newdisqus.controller';

describe('NewdisqusController', () => {
  let controller: NewdisqusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewdisqusController],
    }).compile();

    controller = module.get<NewdisqusController>(NewdisqusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
