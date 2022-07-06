import { Body, Headers,Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller()
export class ContenteventsController {
  constructor(private readonly ContenteventsService: ContenteventsService) {}

  @Post('api/contentevents')
  async create(@Body() CreateContenteventsDto: CreateContenteventsDto) {
    await this.ContenteventsService.create(CreateContenteventsDto);
  }

  @Get('api/contentevents')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Contentevents[]> {
    return this.ContenteventsService.findAll();
  }

  @Get('api/contentevents/:email')
  async findOneId(@Param('email') email: string): Promise<Contentevents> {
    return this.ContenteventsService.findOne(email);
  }

  @Delete('api/contentevents/:id')
  async delete(@Param('id') id: string) {
    return this.ContenteventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitynow')
  async countUsersActivityNow(@Body('date') date: Date): Promise<Object> {
    return this.ContenteventsService.UserActivityNow(date);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitybeforetoday')
  async countUserActivityBeforeToday(
    @Body('day') day: number,
  ): Promise<Object> {
    return this.ContenteventsService.UserActivityBeforeToday(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysize')
  async countUserActivitySize(@Body('day') day: number): Promise<Object> {
    return this.ContenteventsService.UserActivitySize(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysizeYear')
  async countUserActivitySizeYear(@Body('year') year: number): Promise<Object> {
    return this.ContenteventsService.UserActivitySizeYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivityyear')
  async countUserActivityYear(@Body('year') year: number): Promise<Object> {
    return this.ContenteventsService.UserActivityYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/friend/:email')
  async friend( @Param('email') email: string, @Headers() headers) {
    var data = await this.ContenteventsService.friend(email,headers);
    return {
      response_code: 202,
      data:data,
      count_friend:(await data).length,
      messages: {
        info: ['Succes Get Friend'],
      },
    };
  }
}
