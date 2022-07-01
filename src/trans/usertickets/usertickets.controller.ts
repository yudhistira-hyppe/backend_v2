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

    var datatiket = await this.userticketsService.findAll();
    var leng = datatiket.length + 1;

    var curdate = new Date(Date.now());
    var beforedate = curdate.toISOString();

    var substrtahun = beforedate.substring(0, 4);
    var numtahun = parseInt(substrtahun);



    var substrbulan = beforedate.substring(7, 5);
    var numbulan = parseInt(substrbulan);
    var substrtanggal = beforedate.substring(10, 8);
    var numtanggal = parseInt(substrtanggal);

    var rotahun = this.romawi(numtahun);
    var robulan = this.romawi(numbulan);
    var rotanggal = this.romawi(numtanggal);
    var no = "HYPPE/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;

    var ubasic = await this.userbasicsService.findOne(email);

    var iduser = ubasic._id;
    var dt = new Date(Date.now());
    CreateUserticketsDto.IdUser = iduser;
    CreateUserticketsDto.datetime = dt.toISOString();
    CreateUserticketsDto.nomortiket = no;

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

  @Post('api/usertickets/list')
  @UseGuards(JwtAuthGuard)
  async search(@Req() request: Request): Promise<any> {
    var status = null;
    var tipe = null;

    var page = 0;
    var limit = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["status"] !== undefined) {
      status = request_json["status"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["tipe"] !== undefined) {
      tipe = request_json["tipe"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    let dataall = await this.userticketsService.searchdataall(status, tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.searchdata(status, tipe, page, limit);
    var totalrow = data.length;
    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
  }

  @Post('api/usertickets/allticket')
  @UseGuards(JwtAuthGuard)
  async alltiket(@Req() request: Request): Promise<any> {

    var tipe = null;
    var page = 0;
    var limit = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["tipe"] !== undefined) {
      tipe = request_json["tipe"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    let dataall = await this.userticketsService.all(tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.alldatatiket(tipe, page, limit);
    if (!data) {
      throw new Error('Todo is not found!');
    }
    var totalrow = data.length;
    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
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
