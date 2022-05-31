import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { MediaprofilepictsService } from './mediaprofilepicts.service';
import { CreateMediaprofilepictsDto } from './dto/create-mediaprofilepicts.dto';
import { Mediaprofilepicts } from './schemas/mediaprofilepicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediaprofilepicts')
export class MediaprofilepictsController {
    constructor(private readonly MediaprofilepictsService: MediaprofilepictsService) {}

    @Post()
    async create(@Body() CreateMediaprofilepictsDto: CreateMediaprofilepictsDto) {
      await this.MediaprofilepictsService.create(CreateMediaprofilepictsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Mediaprofilepicts[]> {
      return this.MediaprofilepictsService.findAll();
    }
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Mediaprofilepicts> {
      return this.MediaprofilepictsService.findOne(id);
    }
  

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.MediaprofilepictsService.delete(id);
    }
}
