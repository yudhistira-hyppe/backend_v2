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

  @UseGuards(JwtAuthGuard)
  @Post('useractivitynow')
  async countUsersActivityNow(@Body('date') date: Date): Promise<Object> {
    return this.ContenteventsService.UserActivityNow(date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivitybeforetoday')
  async countUserActivityBeforeToday(
    @Body('day') day: number,
  ): Promise<Object> {
    return this.ContenteventsService.UserActivityBeforeToday(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivitysize')
  async countUserActivitySize(@Body('day') day: number): Promise<Object> {
    return this.ContenteventsService.UserActivitySize(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivitysizeYear')
  async countUserActivitySizeYear(@Body('year') year: number): Promise<Object> {
    return this.ContenteventsService.UserActivitySizeYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivityyear')
  async countUserActivityYear(@Body('year') year: number): Promise<Object> {
    return this.ContenteventsService.UserActivityYear(year);
  }
}
