import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ContentdailyqueueService } from './contentdailyqueue.service';
import { CreateContentdailyqueuesDto } from './dto/create-contentdailyqueue.dto';
import { Contentdailyqueues } from './schemas/contentdailyqueue.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/contentdailyqueue')
export class ContentdailyqueueController {

    constructor(private readonly ContentdailyqueuesService: ContentdailyqueueService) {}

    @Post()
    async create(@Body() CreateContentdailyqueuesDto: CreateContentdailyqueuesDto) {
      await this.ContentdailyqueuesService.create(CreateContentdailyqueuesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Contentdailyqueues[]> {
      return this.ContentdailyqueuesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Contentdailyqueues> {
      return this.ContentdailyqueuesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ContentdailyqueuesService.delete(id);
    }
}
