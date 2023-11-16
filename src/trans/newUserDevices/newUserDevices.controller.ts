import { Controller, Get } from '@nestjs/common';
import { NewUserDevicesService } from './newUserDevices.service';

@Controller('api/newuserdevices')
export class NewUserDevicesController {
  constructor(private readonly newUserDevicesService: NewUserDevicesService) 
  {}
}
