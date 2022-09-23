import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Req, Request, Query, Headers, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';
import { UserplaylistService } from './userplaylist.service';
import { CreateUserplaylistDto } from './dto/create-userplaylist.dto';
import { Userplaylist } from './schemas/userplaylist.schema';

@Controller()
export class UserplaylistController {
  constructor(private readonly userplaylistService: UserplaylistService) { }

  @Post()
  async create(@Body() CreateUserplaylistDto: CreateUserplaylistDto) {
    await this.userplaylistService.create(CreateUserplaylistDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userplaylist[]> {
    return this.userplaylistService.findAll();
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userplaylistService.delete(id);
  }
}