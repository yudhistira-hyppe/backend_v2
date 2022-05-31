import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { JwtrefreshtokenService } from './jwtrefreshtoken.service';
import { CreateJwtrefreshtokenDto } from './dto/create-jwtrefreshtoken.dto';
import { Jwtrefreshtoken } from './schemas/jwtrefreshtoken.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/jwtrefreshtoken')
export class JwtrefreshtokenController {

    constructor(private readonly jwtrefreshtokenService: JwtrefreshtokenService) {}

    @Post()
    async create(@Body() CreateJwtrefreshtokenDto: CreateJwtrefreshtokenDto) {
      await this.jwtrefreshtokenService.create(CreateJwtrefreshtokenDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(): Promise<Jwtrefreshtoken[]> {
      return this.jwtrefreshtokenService.findAll();
    }
  
    // @Get(':id')
    // async findOneId(@Param('id') id: string): Promise<Userauth> {
    //   return this.userauthsService.findOne(id);
    // }

    @Get(':email')
    async findOne(@Param('email') email: string): Promise<Jwtrefreshtoken> {
      return this.jwtrefreshtokenService.findOne(email);
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.jwtrefreshtokenService.delete(id);
    }
}
