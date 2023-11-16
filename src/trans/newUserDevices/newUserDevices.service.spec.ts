import { Test, TestingModule } from '@nestjs/testing';
import { NewUserDevicesService } from './newUserDevices.service';

describe('NewUserDevicesService', () => {
  let service: NewUserDevicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewUserDevicesService],
    }).compile();

    service = module.get<NewUserDevicesService>(NewUserDevicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
