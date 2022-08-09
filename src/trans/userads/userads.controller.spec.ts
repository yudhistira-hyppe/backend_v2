import { Test, TestingModule } from '@nestjs/testing';
import { UserAdsController } from './userads.controller';

describe('UserAdsController', () => {
    let controller: UserAdsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        controllers: [UserAdsController],
    }).compile();

      controller = module.get<UserAdsController>(UserAdsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
