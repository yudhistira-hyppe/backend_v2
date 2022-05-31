import { Test, TestingModule } from '@nestjs/testing';
import { UserdevicesController } from './userdevices.controller';

describe('UserdevicesController', () => {
  let controller: UserdevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserdevicesController],
    }).compile();

    controller = module.get<UserdevicesController>(UserdevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
