import { Test, TestingModule } from '@nestjs/testing';
import { ReportuserController } from './reportuser.controller';

describe('ReportuserController', () => {
  let controller: ReportuserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportuserController],
    }).compile();

    controller = module.get<ReportuserController>(ReportuserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
