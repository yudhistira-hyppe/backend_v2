import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicnewController } from './userbasicnew.controller';

describe('UserbasicnewController', () => {
  let controller: UserbasicnewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserbasicnewController],
    }).compile();

    controller = module.get<UserbasicnewController>(UserbasicnewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
