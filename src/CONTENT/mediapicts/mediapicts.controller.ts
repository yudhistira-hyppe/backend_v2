import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediapictsService } from './mediapicts.service';
import { CreateMediapictsDto } from './dto/create-mediapicts.dto';
import { Mediapicts } from './schemas/mediapicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediapicts')
export class MediapictsController {
    constructor(private readonly MediapictsService: MediapictsService) {}

    @Post()
    async create(@Body() CreateMediapictsDto: CreateMediapictsDto) {
      await this.MediapictsService.create(CreateMediapictsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediapicts[]> {
      return this.MediapictsService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediapicts> {
      return this.MediapictsService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediapictsService.delete(id);
    }
}
