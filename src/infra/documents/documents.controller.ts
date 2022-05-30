import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentsDto } from './dto/create-documents.dto';
import { Documents } from './schemas/documents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/documents')
export class DocumentsController {

    constructor(private readonly documentsService: DocumentsService) {}

    @Post()
    async create(@Body() CreateDocumentsDto: CreateDocumentsDto) {
      await this.documentsService.create(CreateDocumentsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Documents[]> {
      return this.documentsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Documents> {
      return this.documentsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.documentsService.delete(id);
    }
}
