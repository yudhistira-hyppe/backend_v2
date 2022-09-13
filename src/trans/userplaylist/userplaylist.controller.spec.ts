import { Test, TestingModule } from '@nestjs/testing';
import { UserplaylistController } from './userplaylist.controller';

describe('UserplaylistController', () => {
  let controller: UserplaylistController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserplaylistController],
    }).compile();

    controller = module.get<UserplaylistController>(UserplaylistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
