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
    CreateFaqsDto.active = true;
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

  @UseGuards(JwtAuthGuard)
  @Put('api/faqs/:id')
  async update(@Res() res, @Param('id') id: string, @Body() createFaqsDto: CreateFaqsDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.faqService.update(id, createFaqsDto);
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
  @Put('api/faqs/delete/:id')
  async delete(@Res() res, @Param('id') id: string) {

    const messages = {
      "info": ["The proses successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.faqService.delete(id);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }


  @Post('api/faqs/allfaqs')
  // @UseGuards(JwtAuthGuard)
  async all(@Req() request: Request): Promise<any> {
    const mongoose = require('mongoose');
    var tipe = null;
    var key = null;
    var kategori = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["tipe"] !== undefined) {
      tipe = request_json["tipe"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    key = request_json["key"];
    kategori = request_json["kategori"];
    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.faqService.listfaq(tipe, key, kategori);
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
