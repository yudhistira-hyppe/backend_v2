import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DisquslogsService } from './disquslogs.service';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs } from './schemas/disquslogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/disquslogs')
export class DisquslogsController {
    constructor(private readonly DisquslogsService: DisquslogsService) {}

    @Post()
    async create(@Body() CreateDisquslogsDto: CreateDisquslogsDto) {
      await this.DisquslogsService.create(CreateDisquslogsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Disquslogs[]> {
      return this.DisquslogsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Disquslogs> {
      return this.DisquslogsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.DisquslogsService.delete(id);
    }
}
