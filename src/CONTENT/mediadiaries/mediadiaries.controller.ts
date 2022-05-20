import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediadiariesService } from './Mediadiaries.service';
import { CreateMediadiariesDto } from './dto/create-Mediadiaries.dto';
import { Mediadiaries } from './schemas/Mediadiaries.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/mediadiaries')
export class MediadiariesController {
    constructor(private readonly MediadiariesService: MediadiariesService) {}

    @Post()
    async create(@Body() CreateMediadiariesDto: CreateMediadiariesDto) {
      await this.MediadiariesService.create(CreateMediadiariesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediadiaries[]> {
      return this.MediadiariesService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediadiaries> {
      return this.MediadiariesService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediadiariesService.delete(id);
    }
}
