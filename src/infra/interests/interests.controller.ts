import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { InterestsService } from './interests.service';
import { CreateInterestsDto } from './dto/create-interests.dto';
import { Interests } from './schemas/interests.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/interests')
export class InterestsController {
    constructor(private readonly InterestsService: InterestsService) {}

    @Post()
    async create(@Body() CreateInterestsDto: CreateInterestsDto) {
      await this.InterestsService.create(CreateInterestsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Interests[]> {
      return this.InterestsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Interests> {
      return this.InterestsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.InterestsService.delete(id);
    }
}
