import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediavideosService } from './Mediavideos.service';
import { CreateMediavideosDto } from './dto/create-Mediavideos.dto';
import { Mediavideos } from './schemas/Mediavideos.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediavideos')
export class MediavideosController {
    constructor(private readonly MediavideosService: MediavideosService) {}

    @Post()
    async create(@Body() CreateMediavideosDto: CreateMediavideosDto) {
      await this.MediavideosService.create(CreateMediavideosDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediavideos[]> {
      return this.MediavideosService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediavideos> {
      return this.MediavideosService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediavideosService.delete(id);
    }
}
