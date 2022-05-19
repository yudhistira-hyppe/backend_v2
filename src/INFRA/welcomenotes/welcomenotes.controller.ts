import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { WelcomenotesService } from './Welcomenotes.service';
import { CreateWelcomenotesDto } from './dto/create-Welcomenotes.dto';
import { Welcomenotes } from './schemas/Welcomenotes.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/welcomenotes')
export class WelcomenotesController {
    constructor(private readonly WelcomenotesService: WelcomenotesService) {}

    @Post()
    async create(@Body() CreateWelcomenotesDto: CreateWelcomenotesDto) {
      await this.WelcomenotesService.create(CreateWelcomenotesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Welcomenotes[]> {
      return this.WelcomenotesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Welcomenotes> {
      return this.WelcomenotesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.WelcomenotesService.delete(id);
    }
}
