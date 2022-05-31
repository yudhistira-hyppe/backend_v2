import { Test, TestingModule } from '@nestjs/testing';
import { WelcomenotesController } from './welcomenotes.controller';

describe('WelcomenotesController', () => {
  let controller: WelcomenotesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WelcomenotesController],
    }).compile();

    controller = module.get<WelcomenotesController>(WelcomenotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
