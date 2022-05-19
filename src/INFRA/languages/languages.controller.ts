import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { LanguagesService } from './Languages.service';
import { CreateLanguagesDto } from './dto/create-Languages.dto';
import { Languages } from './schemas/Languages.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/languages')
export class LanguagesController {

    constructor(private readonly LanguagesService: LanguagesService) {}

    @Post()
    async create(@Body() CreateLanguagesDto: CreateLanguagesDto) {
      await this.LanguagesService.create(CreateLanguagesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Languages[]> {
      return this.LanguagesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Languages> {
      return this.LanguagesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.LanguagesService.delete(id);
    }
}
