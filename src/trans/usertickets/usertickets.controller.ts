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
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
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
    var angka = await this.generateNumber();
    var no = "HYPPE/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;

    var ubasic = await this.userbasicsService.findOne(email);

    var iduser = ubasic._id;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
    var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
    var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
    CreateUserticketsDto.IdUser = iduser;
    CreateUserticketsDto.datetime = dt.toISOString();
    CreateUserticketsDto.nomortiket = no;
    CreateUserticketsDto.active = true;
    CreateUserticketsDto.categoryTicket = idcategory;
    CreateUserticketsDto.sourceTicket = idsource;
    CreateUserticketsDto.levelTicket = idlevel;

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
    var startdate = null;
    var enddate = null;

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

    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    const messages = {
      "info": ["The process successful"],
    };

    let dataall = await this.userticketsService.searchdataall(status, tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.searchdata(status, tipe, startdate, enddate, page, limit);
    var totalrow = data.length;
    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
  }

  @Post('api/usertickets/allticket')
  @UseGuards(JwtAuthGuard)
  async alltiket(@Req() request: Request): Promise<any> {
    var startdate = null;
    var enddate = null;
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

    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    let dataall = await this.userticketsService.all(tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.alldatatiket(tipe, startdate, enddate, page, limit);
    if (!data) {
      throw new Error('Todo is not found!');
    }
    var totalrow = data.length;
    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/:id')
  async update(@Res() res, @Param('id') id: string, @Body() createUserticketsDto: CreateUserticketsDto) {
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    var idobj = mongoose.Types.ObjectId(id);
    try {
      let data = await this.userticketsService.delete(idobj);
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

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/update/:id')
  async updatedata(@Res() res, @Param('id') id: string, @Body() CreateUserticketsDto: CreateUserticketsDto) {
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {

      var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
      var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
      var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
      var assignto = mongoose.Types.ObjectId(CreateUserticketsDto.assignTo);
      CreateUserticketsDto.active = true;
      CreateUserticketsDto.categoryTicket = idcategory;
      CreateUserticketsDto.sourceTicket = idsource;
      CreateUserticketsDto.levelTicket = idlevel;
      CreateUserticketsDto.assignTo = assignto;
      let data = await this.userticketsService.updatedata(id, CreateUserticketsDto);
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

  @Post('api/usertickets/filter')
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var search = null;
    var data = null;
    var skip = null;
    var limit = null;
    var countrow = null;
    var startdate = null;
    var enddate = null;
    var sumber = null;
    var level = null;
    var status = null;
    var sort = null;
    var order = null;
    var kategori = null;
    var startdate = null;
    var enddate = null;

    const messages = {
      "info": ["The process successful"],
    };
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    sumber = request_json["sumber"];
    kategori = request_json["kategori"];
    level = request_json["level"];
    search = request_json["search"];
    status = request_json["status"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    data = await this.userticketsService.filterdata(search, sumber, kategori, level, status, startdate, enddate, skip, limit);

    var allrow = await this.userticketsService.totalcount();
    var totalallrow = allrow[0].countrow;
    var totalrow = data.length;
    return { response_code: 202, data, skip, limit, totalrow, totalallrow, messages };
  }

  @Post('api/usertickets/count')
  @UseGuards(JwtAuthGuard)
  async countticket(): Promise<any> {
    var datanew = null;
    var dataprogres = null;
    var dataclose = null;
    var allrow = null;
    var totalallrow = null;
    var totalnew = null;
    var totalprogress = null;
    var totalclose = null;
    var prosentaseNew = null;
    var prosentaseProgress = null;
    var prosentaseClose = null;
    const messages = {
      "info": ["The process successful"],
    };
    try {
      allrow = await this.userticketsService.totalcount();
      totalallrow = allrow[0].countrow;

    } catch (e) {
      allrow = null;
      totalallrow = 0;
    }
    try {

      datanew = await this.userticketsService.totalcountNew();
      totalnew = datanew[0].countrow;
      prosentaseNew = ((totalnew * 100) / totalallrow).toFixed(1);

    } catch (e) {
      datanew = null;
      totalnew = 0;
      prosentaseNew = 0;
    }

    try {

      dataprogres = await this.userticketsService.totalcountOnProgres();
      totalprogress = dataprogres[0].countrow;
      prosentaseProgress = ((totalprogress * 100) / totalallrow).toFixed(1);

    } catch (e) {
      dataprogres = null;
      totalprogress = 0;
      prosentaseProgress = 0;
    }

    try {

      dataclose = await this.userticketsService.totalcountClose();
      totalclose = dataclose[0].countrow;
      prosentaseClose = ((totalclose * 100) / totalallrow).toFixed(1);
    } catch (e) {

      dataclose = null
      totalclose = 0;
      prosentaseClose = 0;
    }

    var data = {
      "all": totalallrow,
      "new": totalnew,
      "prosentaseNew": prosentaseNew,
      "onprogress": totalprogress,
      "prosentaseProgress": prosentaseProgress,
      "close": totalclose,
      "prosentaseClose": prosentaseClose,
    };



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

  async generateNumber() {
    const getRandomId = (min = 0, max = 500000) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num.toString().padStart(6, "0")
    };
    return getRandomId();
  }
}
