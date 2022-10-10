import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicsnewController } from './userbasicsnew.controller';

describe('UserbasicsnewController', () => {
  let controller: UserbasicsnewController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserbasicsnewController],
    }).compile();

    controller = module.get<UserbasicsnewController>(UserbasicsnewController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
