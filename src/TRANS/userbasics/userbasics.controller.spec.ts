import { Test, TestingModule } from '@nestjs/testing';
import { UserbasicsController } from './userbasics.controller';

describe('UserbasicsController', () => {
  let controller: UserbasicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserbasicsController],
    }).compile();

    controller = module.get<UserbasicsController>(UserbasicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
