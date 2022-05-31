import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { CreateReactionsDto } from './dto/create-reactions.dto';
import { Reactions } from './schemas/reactions.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/reactions')
export class ReactionsController {
    constructor(private readonly ReactionsService: ReactionsService) {}

    @Post()
    async create(@Body() CreateReactionsDto: CreateReactionsDto) {
      await this.ReactionsService.create(CreateReactionsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Reactions[]> {
      return this.ReactionsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Reactions> {
      return this.ReactionsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ReactionsService.delete(id);
    }
}
