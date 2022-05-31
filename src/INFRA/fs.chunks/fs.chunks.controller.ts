import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { FsChunksService } from './fs.chunks.service';
import { CreateFschunksDto } from './dto/create-fs.chunks.dto';
import { Fschunks } from './schemas/fs.chunks.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/fschunks')
export class FsChunksController {

    constructor(private readonly fsChunksService: FsChunksService) {}

    @Post()
    async create(@Body() CreateFschunksDto: CreateFschunksDto) {
      await this.fsChunksService.create(CreateFschunksDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Fschunks[]> {
      return this.fsChunksService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Fschunks> {
      return this.fsChunksService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.fsChunksService.delete(id);
    }
}
