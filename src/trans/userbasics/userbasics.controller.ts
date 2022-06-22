import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Req, Request, Query, Headers } from '@nestjs/common';
import { UserbasicsService } from './userbasics.service';
import { CreateUserbasicDto } from './dto/create-userbasic.dto';
import { Userbasic } from './schemas/userbasic.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';

@Controller('api/userbasics')
export class UserbasicsController {
  constructor(private readonly userbasicsService: UserbasicsService) { }

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
  @UseGuards(JwtAuthGuard)
  @Get(':email')
  async findOne(@Res() res, @Param('email') email: string): Promise<Userbasic> {


    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["The process successful"],
    };

    try {
      let data = await this.userbasicsService.findOne(email);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }

  }




  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userbasicsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractiveyear')
  async countUserActiveGroupByMonth(
    @Body('year') year: number,
  ): Promise<Object> {
    return this.userbasicsService.UserActiveLastYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('useractivebeforetoday')
  async countAllUserActiveDay(@Body('day') day: number): Promise<Object> {
    return this.userbasicsService.UserActiveDay(day);
  }

  //@UseGuards(JwtAuthGuard)
  @Post('userage')
  async userage(): Promise<Object> {
    return this.userbasicsService.UserAge();
  }


  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Res() res, @Param('id') id: string, @Body() createUserbasicDto: CreateUserbasicDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.userbasicsService.update(id, createUserbasicDto);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('v2/interest?')
  async getinterest(@Request() req, @Headers('x-auth-token') auth: string, @Res() res, @Query('langIso') langIso: string, @Query('pageNumber') pageNumber: number, @Query('pageRow') pageRow: number, @Query('search') search: string): Promise<Userbasic> {
    //console.log(auth);
    var reqdata = req.user;
    var email = reqdata.email;
    const messagesEror = {
      "info": ["Todo is not found!"],
    };


    const messages = {
      "info": ["Interests retrieved"],
    };

    var pgnumber = parseInt(pageNumber.toString());
    var pgrow = parseInt(pageRow.toString());
    try {
      let data = await this.userbasicsService.getinterest(email, langIso, pgnumber, pgrow, search);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "total": pgrow.toString(),
        "data": data,
        "message": messages,
        "page": pgnumber.toString()
      });
    } catch (e) {
      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": e.toString()
      });
    }

  }
}
