import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCitiesDto } from './dto/create-cities.dto';
import { Cities } from './schemas/cities.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/cities')
export class CitiesController {

    constructor(private readonly citiesService: CitiesService) {}

    @Post()
    async create(@Body() CreateCitiesDto: CreateCitiesDto) {
      await this.citiesService.create(CreateCitiesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Cities[]> {
      return this.citiesService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: String): Promise<Cities> {
      return this.citiesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.citiesService.delete(id);
    }
}
