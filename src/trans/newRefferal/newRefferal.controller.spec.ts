import { Test, TestingModule } from '@nestjs/testing';
import { NewRefferalController } from './newRefferal.controller';
import { NewRefferalService } from './newRefferal.service';

describe('NewRefferalController', () => {
  let controller: NewRefferalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewRefferalController],
      providers: [NewRefferalService],
    }).compile();

    controller = module.get<NewRefferalController>(NewRefferalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
