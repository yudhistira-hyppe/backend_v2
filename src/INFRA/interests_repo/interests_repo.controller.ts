import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { InterestsRepoService } from './interests_repo.service';
import { CreateInterestsRepoDto } from './dto/create-interests_repo.dto';
import { Interestsrepo } from './schemas/interests_repo.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/interestsrepo')
export class InterestsRepoController {
    constructor(private readonly InterestsRepoService: InterestsRepoService) {}

    @Post()
    async create(@Body() CreateInterestsRepoDto: CreateInterestsRepoDto) {
      await this.InterestsRepoService.create(CreateInterestsRepoDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Interestsrepo[]> {
      return this.InterestsRepoService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Interestsrepo> {
      return this.InterestsRepoService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.InterestsRepoService.delete(id);
    }
}
