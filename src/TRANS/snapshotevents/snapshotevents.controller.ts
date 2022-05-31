import { Body, Controller, Delete, Get, Param, Post ,UseGuards} from '@nestjs/common';
import { SnapshoteventsService } from './snapshotevents.service';
import { CreateSnapshoteventsDto } from './dto/create-snapshotevents.dto';
import { Snapshotevents } from './schemas/snapshotevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/snapshotevents')
export class SnapshoteventsController {
    constructor(private readonly snapshoteventsService: SnapshoteventsService) {}

    @Post()
    async create(@Body() CreateSnapshoteventsDto: CreateSnapshoteventsDto) {
      await this.snapshoteventsService.create(CreateSnapshoteventsDto);
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Snapshotevents[]> {
      return this.snapshoteventsService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Snapshotevents> {
      return this.snapshoteventsService.findOne(id);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.snapshoteventsService.delete(id);
    }

}
