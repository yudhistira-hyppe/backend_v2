import { Test, TestingModule } from '@nestjs/testing';
import { AdsplacesController } from './adsplaces.controller';

describe('AdsplacesController', () => {
  let controller: AdsplacesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsplacesController],
    }).compile();

    controller = module.get<AdsplacesController>(AdsplacesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
