import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DomaineventsService } from './domainevents.service';
import { CreateDomaineventsDto } from './dto/create-domainevents.dto';
import { Domainevents } from './schemas/domainevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/domainevents')
export class DomaineventsController {

    constructor(private readonly domaineventsService: DomaineventsService) {}

    @Post()
    async create(@Body() CreateDomaineventsDto: CreateDomaineventsDto) {
      await this.domaineventsService.create(CreateDomaineventsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Domainevents[]> {
      return this.domaineventsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Domainevents> {
      return this.domaineventsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.domaineventsService.delete(id);
    }
}
