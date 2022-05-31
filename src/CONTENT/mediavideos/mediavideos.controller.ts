import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediavideosService } from './mediavideos.service';
import { CreateMediavideosDto } from './dto/create-mediavideos.dto';
import { Mediavideos } from './schemas/mediavideos.schema';
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
