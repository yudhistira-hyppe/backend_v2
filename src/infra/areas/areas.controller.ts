import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreasDto } from './dto/create-areas.dto';
import { Areas } from './schemas/areas.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/areas')
export class AreasController {

    constructor(private readonly areasService: AreasService) {}

    @Post()
    async create(@Body() CreateAreasDto: CreateAreasDto) {
      await this.areasService.create(CreateAreasDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Areas[]> {
      return this.areasService.findAll();
    }
  
    @Get(':countryID')
    async findOneId(@Param('countryID') countryID: String): Promise<Areas> {
      return this.areasService.findOne(countryID);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.areasService.delete(id);
    }
}

