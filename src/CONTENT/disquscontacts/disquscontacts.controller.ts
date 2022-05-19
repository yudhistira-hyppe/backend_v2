import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DisquscontactsService } from './Disquscontacts.service';
import { CreateDisquscontactsDto } from './dto/create-Disquscontacts.dto';
import { Disquscontacts } from './schemas/Disquscontacts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/disquscontacts')
export class DisquscontactsController {
    constructor(private readonly DisquscontactsService: DisquscontactsService) {}

    @Post()
    async create(@Body() CreateDisquscontactsDto: CreateDisquscontactsDto) {
      await this.DisquscontactsService.create(CreateDisquscontactsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Disquscontacts[]> {
      return this.DisquscontactsService.findAll();
    }
  
    @Get(':email')
    async findOneId(@Param('email') email: string): Promise<Disquscontacts> {
      return this.DisquscontactsService.findOne(email);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.DisquscontactsService.delete(id);
    }
}
