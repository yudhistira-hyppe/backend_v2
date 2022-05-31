import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediastoriesService } from './mediastories.service';
import { CreateMediastoriesDto } from './dto/create-mediastories.dto';
import { Mediastories } from './schemas/mediastories.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediastories')
export class MediastoriesController {

    constructor(private readonly MediastoriesService: MediastoriesService) {}

    @Post()
    async create(@Body() CreateMediastoriesDto: CreateMediastoriesDto) {
      await this.MediastoriesService.create(CreateMediastoriesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediastories[]> {
      return this.MediastoriesService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediastories> {
      return this.MediastoriesService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediastoriesService.delete(id);
    }
}
