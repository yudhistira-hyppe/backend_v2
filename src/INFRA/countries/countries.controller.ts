import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { Countries } from './schemas/countries.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/countries')
export class CountriesController {

    constructor(private readonly countriesService: CountriesService) {}

    @Post()
    async create(@Body() CreateCountriesDto: CreateCountriesDto) {
      await this.countriesService.create(CreateCountriesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Countries[]> {
      return this.countriesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Countries> {
      return this.countriesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.countriesService.delete(id);
    }
}
