import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { InsightlogsService } from './Insightlogs.service';
import { CreateInsightlogsDto } from './dto/create-Insightlogs.dto';
import { Insightlogs } from './schemas/Insightlogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/insightlogs')
export class InsightlogsController {

    constructor(private readonly InsightlogsService: InsightlogsService) {}

    @Post()
    async create(@Body() CreateInsightlogsDto: CreateInsightlogsDto) {
      await this.InsightlogsService.create(CreateInsightlogsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Insightlogs[]> {
      return this.InsightlogsService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Insightlogs> {
      return this.InsightlogsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.InsightlogsService.delete(id);
    }
}
