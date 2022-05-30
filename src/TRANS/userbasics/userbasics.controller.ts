import { Body, Controller, Delete, Get, Param, Post,UseGuards ,Put,BadRequestException} from '@nestjs/common';
import { UserbasicsService } from './userbasics.service';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic } from './schemas/userbasic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';


@Controller('api/userbasics')
export class UserbasicsController {

    constructor(private readonly userbasicsService: UserbasicsService) {}

    @Post()
    async create(@Body() CreateUserbasicDto: CreateUserbasicDto) {
      await this.userbasicsService.create(CreateUserbasicDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Userbasic[]> {
      return this.userbasicsService.findAll();
    }
  
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Userbasic> {
    //   return this.userbasicsService.findOne(id);
    // }
    @Get(':email')
    async findOne(@Param('email') email: string): Promise<Userbasic> {
      return this.userbasicsService.findOne(email);
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.userbasicsService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
  async update(@Res() res, @Param('id') id: string, @Body() CreateUserbasicDto: CreateUserbasicDto) {
    const messages = {
      "info":["The update successful"],
    };
    let data = await this.userbasicsService.update(id, CreateUserbasicDto);
       return res.status(HttpStatus.OK).json({
        response_code: 202,
      "message": messages
  })
  }
}
