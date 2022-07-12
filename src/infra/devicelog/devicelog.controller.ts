import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DevicelogService } from './devicelog.service';
import { CreateDevicelogDto } from './dto/create-devicelog.dto';
import { Devicelog } from './schemas/devicelog.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/documents')
export class DevicelogController {

    constructor(private readonly devicelogService: DevicelogService) {}

    @Post()
    async create(@Body() CreateDevicelogDto: CreateDevicelogDto) {
      await this.devicelogService.create(CreateDevicelogDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Devicelog[]> {
      return this.devicelogService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Devicelog> {
      return this.devicelogService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.devicelogService.delete(id);
    }
}
