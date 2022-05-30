import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { Templates } from './schemas/templates.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/templates')
export class TemplatesController {

    constructor(private readonly TemplatesService: TemplatesService) {}

    @Post()
    async create(@Body() CreateTemplatesDto: CreateTemplatesDto) {
      await this.TemplatesService.create(CreateTemplatesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Templates[]> {
      return this.TemplatesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Templates> {
      return this.TemplatesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.TemplatesService.delete(id);
    }
}
