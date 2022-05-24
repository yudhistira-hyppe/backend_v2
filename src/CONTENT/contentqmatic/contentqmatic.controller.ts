import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ContentqmaticService } from './contentqmatic.service';
import { CreateContentqmaticDto } from './dto/create-contentqmatic.dto';
import { Contentqmatic } from './schemas/contentqmatic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/contentqmatic')
export class ContentqmaticController {
    constructor(private readonly ContentqmaticService: ContentqmaticService) {}

    @Post()
    async create(@Body() CreateContentqmaticDto: CreateContentqmaticDto) {
      await this.ContentqmaticService.create(CreateContentqmaticDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Contentqmatic[]> {
      return this.ContentqmaticService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Contentqmatic> {
      return this.ContentqmaticService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ContentqmaticService.delete(id);
    }

}
