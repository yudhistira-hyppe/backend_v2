import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DisqusService } from './Disqus.service';
import { CreateDisqusDto } from './dto/create-Disqus.dto';
import { Disqus } from './schemas/Disqus.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/disqus')
export class DisqusController {

    constructor(private readonly DisqusService: DisqusService) {}

    @Post()
    async create(@Body() CreateDisqusDto: CreateDisqusDto) {
      await this.DisqusService.create(CreateDisqusDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Disqus[]> {
      return this.DisqusService.findAll();
    }
  
    @Get(':email')
    async findOneId(@Param('email') email: string): Promise<Disqus> {
      return this.DisqusService.findOne(email);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.DisqusService.delete(id);
    }
}
