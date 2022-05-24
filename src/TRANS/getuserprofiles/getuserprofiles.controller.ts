import { Body, Controller, Delete, Get, Param, Post,UseGuards,Query } from '@nestjs/common';
import { GetuserprofilesService } from './getuserprofiles.service';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles } from './schemas/getuserprofiles.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationParams } from './utils/paginationParams';

@Controller('api/getuserprofiles')
export class GetuserprofilesController {

    constructor(private readonly getuserprofilesService: GetuserprofilesService) {}

    @Post()
    async create(@Body() CreateGetuserprofilesDto: CreateGetuserprofilesDto) {
      await this.getuserprofilesService.create(CreateGetuserprofilesDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get()
  async getAllPosts(@Query() { skip, limit }: PaginationParams) {
    return this.getuserprofilesService.findAll(skip, limit);
  }
  
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Getuserprofiles> {
    //   return this.GetuserprofilessService.findOne(id);
    // }
    @Get(':fullName')
    async findOne(@Param('fullName') fullName: string): Promise<Getuserprofiles> {
      return this.getuserprofilesService.findOne(fullName);
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.getuserprofilesService.delete(id);
    }
}
