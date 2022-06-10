import { Body, Controller, Delete, Get, Param, Post,UseGuards,Put,Request } from '@nestjs/common';
import { UserticketsService } from './usertickets.service';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';


@Controller('api/usertickets')
export class UserticketsController {
    constructor(private readonly userticketsService: UserticketsService,private readonly userbasicsService: UserbasicsService) {}


    @UseGuards(JwtAuthGuard)
    @Post()
  async create(@Res() res,@Body() CreateUserticketsDto: CreateUserticketsDto,@Request() req) {
    const messages = {
      "info":["The update successful"],
    };

    const messagesEror = {
      "info":["Todo is not found!"],
    };
    var reqdata=req.user;
    var email=reqdata.email;

    var ubasic=await this.userbasicsService.findOne(email);

    var iduser=ubasic._id;
 
    CreateUserticketsDto.IdUser=iduser;
    await this.userticketsService.create(CreateUserticketsDto);

    try{
      let data =  await this.userticketsService.create(CreateUserticketsDto);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "data":data,
        "message": messages
    });
    }catch(e){
      res.status(HttpStatus.BAD_REQUEST).json({
       
        "message": messagesEror
    });
    }
  }

}
