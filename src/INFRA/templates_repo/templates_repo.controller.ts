import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { TemplatesRepoService } from './templates_repo.service';
import { CreateTemplatesRepoDto } from './dto/create-TemplatesRepo.dto';
import { TemplatesRepo } from './schemas/TemplatesRepo.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/templatesrepo')
export class TemplatesRepoController {

    constructor(private readonly TemplatesRepoService: TemplatesRepoService) {}

    @Post()
    async create(@Body() CreateTemplatesRepoDto: CreateTemplatesRepoDto) {
      await this.TemplatesRepoService.create(CreateTemplatesRepoDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<TemplatesRepo[]> {
      return this.TemplatesRepoService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<TemplatesRepo> {
      return this.TemplatesRepoService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.TemplatesRepoService.delete(id);
    }
}
