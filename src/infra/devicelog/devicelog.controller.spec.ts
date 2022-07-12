import { Test, TestingModule } from '@nestjs/testing';
import { DevicelogController } from './devicelog.controller';

describe('DevicelogController', () => {
  let controller: DevicelogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DevicelogController],
    }).compile();

    controller = module.get<DevicelogController>(DevicelogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
