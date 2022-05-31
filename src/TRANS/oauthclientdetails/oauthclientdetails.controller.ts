import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { OauthclientdetailsService } from './oauthclientdetails.service';
import { CreateOauthclientdetailsDto } from './dto/create-oauthclientdetails.dto';
import { Oauthclientdetails } from './schemas/oauthclientdetails.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/oauthclientdetails')
export class OauthclientdetailsController {
    constructor(private readonly oauthclientdetailsService: OauthclientdetailsService) {}

    @Post()
    async create(@Body() CreateOauthclientdetailsDto: CreateOauthclientdetailsDto) {
      await this.oauthclientdetailsService.create(CreateOauthclientdetailsDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Oauthclientdetails[]> {
      return this.oauthclientdetailsService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Oauthclientdetails> {
      return this.oauthclientdetailsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.oauthclientdetailsService.delete(id);
    }
}
