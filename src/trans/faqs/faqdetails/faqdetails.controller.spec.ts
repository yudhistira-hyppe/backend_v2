import { Test, TestingModule } from '@nestjs/testing';
import { UserticketdetailsController } from './userticketdetails.controller';

describe('UserticketdetailsController', () => {
  let controller: UserticketdetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserticketdetailsController],
    }).compile();

    controller = module.get<UserticketdetailsController>(UserticketdetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
