import { Test, TestingModule } from '@nestjs/testing';
import { UserscoresController } from './userscores.controller';

describe('UserscoresController', () => {
  let controller: UserscoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserscoresController],
    }).compile();

    controller = module.get<UserscoresController>(UserscoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
