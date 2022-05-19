import { Test, TestingModule } from '@nestjs/testing';
import { CorevaluesController } from './corevalues.controller';

describe('CorevaluesController', () => {
  let controller: CorevaluesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorevaluesController],
    }).compile();

    controller = module.get<CorevaluesController>(CorevaluesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
