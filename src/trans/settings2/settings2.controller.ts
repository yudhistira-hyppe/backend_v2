import { Settings2Service } from './settings2.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Res, Request, UseGuards, HttpStatus, Req, BadRequestException } from '@nestjs/common';
import { CreateSettings2Dto } from './dto/create-settings2.dto';
import { SettingsMixed } from './schemas/settings2.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Max } from 'class-validator';

@Controller('api/settings2')
export class Settings2Controller {
  constructor(private readonly settings2Service: Settings2Service) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // async findAll(): Promise<SettingsMixed[]> {
  //     return this.settings2Service.findAll();
  // }

  //to be continued. get data with mixed ?
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SettingsMixed> {
      return this.settings2Service.findOne(id);
  }

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

      var insertdata = new CreateSettings2Dto();
      var mongoose = require('mongoose');
      insertdata._id = mongoose.Types.ObjectId();
      insertdata.jenis = jenis;
      insertdata.jenisdata = jenisdata;
      insertdata.remark = remark;
      insertdata.typedata = typedata;
      insertdata.sortObject = sortObject;
      insertdata.Max = max;
      insertdata.Min = min;
      insertdata.value = value;

      var data = await this.settings2Service.create(insertdata);
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

      var updatedata = new CreateSettings2Dto();
      updatedata.jenis = jenis;
      updatedata.jenisdata = jenisdata;
      updatedata.remark = remark;
      updatedata.typedata = typedata;
      updatedata.sortObject = sortObject;
      updatedata.Max = max;
      updatedata.Min = min;
      updatedata.value = value;

      try {


          let data = await this.settings2Service.update(id, updatedata);
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

  @Get('delete/:id')
  async softdelete(@Param('id') id: string) {
      var updatedata = new CreateSettings2Dto();
      updatedata.isActive = false;

      return this.settings2Service.update(id, updatedata);
  }
}
