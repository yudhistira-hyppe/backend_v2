import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException } from '@nestjs/common';
import { FaqService } from './faqs.service';
import { CreateFaqsDto } from './dto/create-faqs.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';


@Controller()
export class FaqsController {
  constructor(private readonly faqService: FaqService, private readonly userbasicsService: UserbasicsService) { }


  @UseGuards(JwtAuthGuard)
  @Post('api/faqs/createfaq')
  async create(@Res() res, @Body() CreateFaqsDto: CreateFaqsDto, @Request() req) {
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
    var dt = new Date(Date.now());
    CreateFaqsDto.IdUser = iduser;
    CreateFaqsDto.datetime = dt.toISOString();
    CreateFaqsDto.status = "onprogress";


    try {
      let data = await this.faqService.create(CreateFaqsDto);
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

  @Post('api/faqs/retrievefaq')
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

    let data = await this.faqService.retrieve(idticket);

    return { response_code: 202, data, messages };
  }

  @Post('api/usertickets/allticket')
  @UseGuards(JwtAuthGuard)
  async all(): Promise<any> {
    const mongoose = require('mongoose');

    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.faqService.viewalldata();
    if (!data) {
      throw new Error('Todo is not found!');
    }

    return { response_code: 202, data, messages };
  }

  async romawi(num: number) {
    if (typeof num !== 'number')
      return false;

    var roman = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    };
    var str = '';

    for (var i of Object.keys(roman)) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }

    return str;
  }

}
