import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { UserdevicesService } from './userdevices.service';
import { CreateUserdeviceDto } from './dto/create-userdevice.dto';
import { Userdevice } from './schemas/userdevice.schema';

@Controller('api/userdevices')
export class UserdevicesController {

    constructor(private readonly userdevicesService: UserdevicesService) {}

  @Post()
  async create(@Body() CreateUserdeviceDto: CreateUserdeviceDto) {
    await this.userdevicesService.create(CreateUserdeviceDto);
  }

  @Get()
  async findAll(): Promise<Userdevice[]> {
    return this.userdevicesService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Userdevice> {
  //   return this.userdevicesService.findOne(id);
  // }
  @Get(':email')
  async findOne(@Param('email') email: string , @Param('deviceID')deviceID:string): Promise<Userdevice> {
    return this.userdevicesService.findOne(email,deviceID);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userdevicesService.delete(id);
  }

  @Post('countUserActive')
  async countUserActive(): Promise<Object> {
    return this.userdevicesService.countAllUserActiveDay(30);
  }
}
