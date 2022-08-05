import { Test, TestingModule } from '@nestjs/testing';
import { AdstypeController } from './adstype.controller';

describe('AdstypeController', () => {
  let controller: AdstypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdstypeController],
    }).compile();

    controller = module.get<AdstypeController>(AdstypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
