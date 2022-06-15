import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException } from '@nestjs/common';
import { UserticketsService } from './usertickets.service';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';


@Controller()
export class UserticketsController {
  constructor(private readonly userticketsService: UserticketsService, private readonly userbasicsService: UserbasicsService) { }


  @UseGuards(JwtAuthGuard)
  @Post('api/usertickets/createticket')
  async create(@Res() res, @Body() CreateUserticketsDto: CreateUserticketsDto, @Request() req) {
    const messages = {
      "info": ["The create successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    var reqdata = req.user;
    var email = reqdata.email;

    var ubasic = await this.userbasicsService.findOne(email);

    var iduser = ubasic._id;
    var dt = new Date();
    CreateUserticketsDto.IdUser = iduser;
    CreateUserticketsDto.datetime = dt.toISOString();
    CreateUserticketsDto.status = "onprogress";

    try {
      let data = await this.userticketsService.create(CreateUserticketsDto);
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

  @Post('api/usertickets/retrieveticket')
  @UseGuards(JwtAuthGuard)
  async retrieve(@Req() request: Request): Promise<any> {
    const mongoose = require('mongoose');
    var id = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["id"] !== undefined) {
      id = request_json["id"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    var idticket = mongoose.Types.ObjectId(request_json["id"]);
    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.userticketsService.retrieve(idticket);

    return { response_code: 202, data, messages };
  }

  @Post('api/usertickets/allticket')
  @UseGuards(JwtAuthGuard)
  async all(): Promise<any> {
    const mongoose = require('mongoose');

    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.userticketsService.viewalldata();
    if (!data) {
      throw new Error('Todo is not found!');
    }

    return { response_code: 202, data, messages };
  }


}
