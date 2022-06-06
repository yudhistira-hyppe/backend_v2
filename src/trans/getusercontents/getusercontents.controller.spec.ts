import { Test, TestingModule } from '@nestjs/testing';
import { GetusercontentsController } from './getusercontents.controller';

describe('GetusercontentsController', () => {
  let controller: GetusercontentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetusercontentsController],
    }).compile();

    controller = module.get<GetusercontentsController>(GetusercontentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
