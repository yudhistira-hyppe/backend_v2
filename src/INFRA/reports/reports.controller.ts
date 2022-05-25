import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportsDto } from './dto/create-reports.dto';
import { Reports } from './schemas/reports.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/reports')
export class ReportsController {

    constructor(private readonly ReportsService: ReportsService) {}

    @Post()
    async create(@Body() CreateReportsDto: CreateReportsDto) {
      await this.ReportsService.create(CreateReportsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Reports[]> {
      return this.ReportsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Reports> {
      return this.ReportsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ReportsService.delete(id);
    }
}
