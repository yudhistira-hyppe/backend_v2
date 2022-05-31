import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { EulasService } from './eulas.service';
import { CreateEulasDto } from './dto/create-eulas.dto';
import { Eulas } from './schemas/eulas.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/eulas')
export class EulasController {

    constructor(private readonly eulasService: EulasService) {}

    @Post()
    async create(@Body() CreateEulasDto: CreateEulasDto) {
      await this.eulasService.create(CreateEulasDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Eulas[]> {
      return this.eulasService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Eulas> {
      return this.eulasService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.eulasService.delete(id);
    }
}
