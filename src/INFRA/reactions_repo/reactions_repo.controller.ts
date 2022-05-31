import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { ReactionsRepoService } from './reactions_repo.service';
import { CreateReactionsrepoDto } from './dto/create-reactionsrepo.dto';
import { Reactionsrepo } from './schemas/reactionsrepo.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/reactionsrepo')
export class ReactionsRepoController {
    constructor(private readonly ReactionsRepoService: ReactionsRepoService) {}

    @Post()
    async create(@Body() CreateReactionsrepoDto: CreateReactionsrepoDto) {
      await this.ReactionsRepoService.create(CreateReactionsrepoDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Reactionsrepo[]> {
      return this.ReactionsRepoService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Reactionsrepo> {
      return this.ReactionsRepoService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.ReactionsRepoService.delete(id);
    }
}
