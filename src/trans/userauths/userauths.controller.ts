import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res, HttpStatus, Response, Request, Req, BadRequestException } from '@nestjs/common';
import { UserauthsService } from './userauths.service';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth } from './schemas/userauth.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Templates } from '../../infra/templates/schemas/templates.schema';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';

@Controller('api/userauths')
export class UserauthsController {
  constructor(
    private readonly userauthsService: UserauthsService,
    //private readonly utilsService: UtilsService,
    //private readonly errorHandler: ErrorHandler
    ) { }

  @Post()
  async create(@Body() CreateUserauthDto: CreateUserauthDto) {
    await this.userauthsService.create(CreateUserauthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userauth[]> {
    return this.userauthsService.findAll();
  }

  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(id);
  // }
  // @Get(':username')
  // async findOne(@Param('username') username: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(username);
  // }
  @Get(':email')
  async findOne(@Param('email') email: string): Promise<Userauth> {
    return this.userauthsService.findOne(email);
  }
  
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userauthsService.delete(id);
  } 
}
