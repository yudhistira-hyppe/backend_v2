import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { SagasService } from './sagas.service';
import { CreateSagasDto } from './dto/create-sagas.dto';
import { Sagas } from './schemas/sagas.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/sagas')
export class SagasController {
 
        constructor(private readonly sagasService: SagasService) {}
    
        @Post()
        async create(@Body() CreateSagasDto: CreateSagasDto) {
          await this.sagasService.create(CreateSagasDto);
        }
        @UseGuards(JwtAuthGuard)
        @Get()
        async findAll(): Promise<Sagas[]> {
          return this.sagasService.findAll();
        }
      
        @Get(':id')
        async findOne(@Param('id') id: string): Promise<Sagas> {
          return this.sagasService.findOne(id);
        }
      
        @Delete(':id')
        async delete(@Param('id') id: string) {
          return this.sagasService.delete(id);
        }

}
