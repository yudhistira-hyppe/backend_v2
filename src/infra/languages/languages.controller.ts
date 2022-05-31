import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguagesDto } from './dto/create-languages.dto';
import { Languages } from './schemas/languages.schema';
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
