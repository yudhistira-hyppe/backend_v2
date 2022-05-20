import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { CreateInsightsDto } from './dto/create-insights.dto';
import { Insights } from './schemas/insights.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/insights')
export class InsightsController {

    constructor(private readonly InsightsService: InsightsService) {}

    @Post()
    async create(@Body() CreateInsightsDto: CreateInsightsDto) {
      await this.InsightsService.create(CreateInsightsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Insights[]> {
      return this.InsightsService.findAll();
    }
    // @Get(':id')
    // async findOneId(@Param('id') id: string): Promise<Insights> {
    //   return this.InsightsService.findOne(id);
    // }
    @Get(':email')
    async findOneId(@Param('email') email: string): Promise<Insights> {
      return this.InsightsService.findOne(email);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.InsightsService.delete(id);
    }
}
