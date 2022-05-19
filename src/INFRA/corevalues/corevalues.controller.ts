import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { CorevaluesService } from './corevalues.service';
import { CreateCorevaluesDto } from './dto/create-corevalues.dto';
import { Corevalues } from './schemas/corevalues.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/corevalues')
export class CorevaluesController {

    constructor(private readonly corevaluesService: CorevaluesService) {}

    @Post()
    async create(@Body() CreateCorevaluesDto: CreateCorevaluesDto) {
      await this.corevaluesService.create(CreateCorevaluesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Corevalues[]> {
      return this.corevaluesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Corevalues> {
      return this.corevaluesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.corevaluesService.delete(id);
    }
}
