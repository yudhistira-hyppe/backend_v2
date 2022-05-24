import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediaproofpicts')
export class MediaproofpictsController {
    constructor(private readonly MediaproofpictsService: MediaproofpictsService) {}

    @Post()
    async create(@Body() CreateMediaproofpictsDto: CreateMediaproofpictsDto) {
      await this.MediaproofpictsService.create(CreateMediaproofpictsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediaproofpicts[]> {
      return this.MediaproofpictsService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediaproofpicts> {
      return this.MediaproofpictsService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediaproofpictsService.delete(id);
    }
}
