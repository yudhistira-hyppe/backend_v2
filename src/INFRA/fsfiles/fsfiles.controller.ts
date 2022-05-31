import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { FsfilesService } from './fsfiles.service';
import { CreateFsfilesDto } from './dto/create-fsfiles.dto';
import { Fsfiles } from './schemas/fsfiles.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/fsfiles')
export class FsfilesController {

    constructor(private readonly fsfilesService: FsfilesService) {}

    @Post()
    async create(@Body() CreateFsfilesDto: CreateFsfilesDto) {
      await this.fsfilesService.create(CreateFsfilesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Fsfiles[]> {
      return this.fsfilesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Fsfiles> {
      return this.fsfilesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.fsfilesService.delete(id);
    }
}
