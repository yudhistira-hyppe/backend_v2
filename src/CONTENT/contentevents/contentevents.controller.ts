import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/contentevents')
export class ContenteventsController {
    constructor(private readonly ContenteventsService: ContenteventsService) {}

    @Post()
    async create(@Body() CreateContenteventsDto: CreateContenteventsDto) {
      await this.ContenteventsService.create(CreateContenteventsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Contentevents[]> {
      return this.ContenteventsService.findAll();
    }
  
    @Get(':email')
    async findOneId(@Param('email') email: string): Promise<Contentevents> {
      return this.ContenteventsService.findOne(email);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ContenteventsService.delete(id);
    }
}
