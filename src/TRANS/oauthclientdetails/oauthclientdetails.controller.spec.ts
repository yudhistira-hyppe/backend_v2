import { Test, TestingModule } from '@nestjs/testing';
import { OauthclientdetailsController } from './oauthclientdetails.controller';

describe('OauthclientdetailsController', () => {
  let controller: OauthclientdetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OauthclientdetailsController],
    }).compile();

    controller = module.get<OauthclientdetailsController>(OauthclientdetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
