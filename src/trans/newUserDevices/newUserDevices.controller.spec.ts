import { Test, TestingModule } from '@nestjs/testing';
import { NewUserDevicesController } from './newUserDevices.controller';
import { NewUserDevicesService } from './newUserDevices.service';

describe('NewUserDevicesController', () => {
  let controller: NewUserDevicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewUserDevicesController],
      providers: [NewUserDevicesService],
    }).compile();

    controller = module.get<NewUserDevicesController>(NewUserDevicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
