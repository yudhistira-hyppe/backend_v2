import { Settings3Service } from './settings3.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Res, Request, UseGuards, HttpStatus, Req, BadRequestException } from '@nestjs/common';
import { CreateSettings3Dto } from './dto/create-settings3.dto';
import { SettingsString } from './schemas/settings3.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Max } from 'class-validator';

@Controller('api/settings/string')
export class Settings3Controller {
  constructor(private readonly settings3Service: Settings3Service) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(): Promise<SettingsString[]> {
  //     return this.settings3Service.findAll();
  // }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() request: Request) {
      const messages = {
          "info": ["The process successful"],
      };
      
      var value = null;
      var remark = null;
      var jenis = null;
      var max = null;
      var min = null;
      var min = null;
      var sortObject = null;
      var jenisdata = null;
      var typedata = null;
      
      var request_json = JSON.parse(JSON.stringify(request.body));
      if (request_json["value"] !== undefined) {
        value = request_json["value"];
      } else {
        throw new BadRequestException("value field is required");
      }

      if (request_json["jenis"] !== undefined) {
        jenis = request_json["jenis"];
      } else {
        throw new BadRequestException("jenis field is required");
      }

      if (request_json["remark"] !== undefined) {
        remark = request_json["remark"];
      } else {
        throw new BadRequestException("remark field is required");
      }

      if (request_json["jenisdata"] !== undefined) {
        jenisdata = request_json["jenisdata"];
      } else {
        throw new BadRequestException("jenisdata field is required");
      }

      if (request_json["typedata"] !== undefined) {
        typedata = request_json["typedata"];
      } else {
        throw new BadRequestException("typedata field is required");
      }

      if (request_json["Max"] !== undefined) {
        max = request_json["Max"];
      }

      if (request_json["Min"] !== undefined) {
        min = request_json["Min"];
      }

      if (request_json["sortObject"] !== undefined) {
        sortObject = request_json["sortObject"];
      }

      var insertdata = new CreateSettings3Dto();
      var mongoose = require('mongoose');
      insertdata._id = mongoose.Types.ObjectId();
      insertdata.jenis = jenis;
      insertdata.jenisdata = jenisdata;
      insertdata.remark = remark;
      insertdata.typedata = typedata;
      insertdata.sortObject = sortObject;
      insertdata.Max = max;
      insertdata.Min = min;
      insertdata.value = value.toString();

      var data = await this.settings3Service.create(insertdata);
      return { response_code: 202, data, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateid(@Res() res, @Param('id') id: string, @Request() request) {
      const messages = {
          "info": ["The update successful"],
      };

      const messagesEror = {
          "info": ["Todo is not found!"],
      };

      var value = null;
      var remark = null;
      var jenis = null;
      var max = null;
      var min = null;
      var min = null;
      var sortObject = null;
      var jenisdata = null;
      var typedata = null;
      
      var request_json = JSON.parse(JSON.stringify(request.body));
      if (request_json["value"] !== undefined) {
        value = request_json["value"];
      } else {
        throw new BadRequestException("value field is required");
      }

      if (request_json["jenis"] !== undefined) {
        jenis = request_json["jenis"];
      } else {
        throw new BadRequestException("jenis field is required");
      }

      if (request_json["remark"] !== undefined) {
        remark = request_json["remark"];
      } else {
        throw new BadRequestException("remark field is required");
      }

      if (request_json["jenisdata"] !== undefined) {
        jenisdata = request_json["jenisdata"];
      } else {
        throw new BadRequestException("jenisdata field is required");
      }

      if (request_json["typedata"] !== undefined) {
        typedata = request_json["typedata"];
      } else {
        throw new BadRequestException("typedata field is required");
      }

      if (request_json["Max"] !== undefined) {
        max = request_json["Max"];
      }

      if (request_json["Min"] !== undefined) {
        min = request_json["Min"];
      }

      if (request_json["sortObject"] !== undefined) {
        sortObject = request_json["sortObject"];
      }

      var updatedata = new CreateSettings3Dto();
      updatedata.jenis = jenis;
      updatedata.jenisdata = jenisdata;
      updatedata.remark = remark;
      updatedata.typedata = typedata;
      updatedata.sortObject = sortObject;
      updatedata.Max = max;
      updatedata.Min = min;
      updatedata.value = value.toString();

      try {


          let data = await this.settings3Service.update(id, updatedata);
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
}
