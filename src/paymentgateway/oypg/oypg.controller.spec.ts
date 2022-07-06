import { Test, TestingModule } from '@nestjs/testing';
import { OyPgController } from './oypg.controller';

describe('OyPgController', () => {
  let controller: OyPgController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OyPgController],
    }).compile();

    controller = module.get<OyPgController>(OyPgController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
