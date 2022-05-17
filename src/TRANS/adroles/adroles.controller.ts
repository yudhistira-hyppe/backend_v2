import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { AdrolesService } from './adroles.service';
import { CreateAdrolesDto } from './dto/create-adroles.dto';
import { Adroles } from './schemas/adroles.schema';

@Controller('api/adroles')
export class AdrolesController {

    constructor(private readonly adrolesService: AdrolesService) {}
    
        @Post()
        async create(@Body() CreateAdrolesDto: CreateAdrolesDto) {
          await this.adrolesService.create(CreateAdrolesDto);
        }
      
        @Get()
        async findAll(): Promise<Adroles[]> {
          return this.adrolesService.findAll();
        }
      
        @Get(':id')
        async findOne(@Param('id') id: string): Promise<Adroles> {
          return this.adrolesService.findOne(id);
        }
      
        @Delete(':id')
        async delete(@Param('id') id: string) {
          return this.adrolesService.delete(id);
        }
}
