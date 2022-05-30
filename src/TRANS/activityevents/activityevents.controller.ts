import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ActivityeventsService } from './activityevents.service';
import { CreateActivityeventsDto } from './dto/create-activityevents.dto';
import { Activityevents } from './schemas/activityevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/activityevents')
export class ActivityeventsController {
  constructor(private readonly activityeventsService: ActivityeventsService) {}

  @Post()
  async create(@Body() CreateActivityeventsDto: CreateActivityeventsDto) {
    await this.activityeventsService.create(CreateActivityeventsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Activityevents[]> {
    return this.activityeventsService.findAll();
  }

  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Activityevents> {
    return this.activityeventsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.activityeventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logsctivitas')
  async countPost(@Body('year') year: number): Promise<Object> {
    return this.activityeventsService.LogActivitas(year);
  }
}
