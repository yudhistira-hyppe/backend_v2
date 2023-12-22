import { Body, Controller, Delete, Get, Param, Post, UseGuards, BadRequestException, Request, Headers, Put } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplatesDto } from './dto/create-templates.dto';
import { Templates } from './schemas/templates.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/templates')
export class TemplatesController {

  constructor(private readonly TemplatesService: TemplatesService,
  ) { }

  @Post()
  async create(@Body() CreateTemplatesDto: CreateTemplatesDto) {
    CreateTemplatesDto.active = true;
    await this.TemplatesService.create(CreateTemplatesDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Templates[]> {
    return this.TemplatesService.findAll();
  }

  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Templates> {
    // return this.TemplatesService.findOne(id);
    return this.TemplatesService.findOne2(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/delete/:id')
  async delete(@Param('id') id: string, @Headers() headers) {
    if (id == undefined || id == "") {
      throw new BadRequestException("Unabled to proceed,id required");
    }
    await this.TemplatesService.updateNonactive(id);
    var response = {
      "response_code": 202,
      "messages": {
        info: ['Successfuly'],
      },
    }
    return response;

  }

  @UseGuards(JwtAuthGuard)
  @Post('listing/push_notification')
  async listing(@Request() req) {
    var keyword = null;
    var startdate = null;
    var enddate = null;
    var sorting = null;
    var page = null;
    var limit = null;

    var request_json = JSON.parse(JSON.stringify(req.body));
    if (request_json['ascending'] != null && request_json['ascending'] != undefined) {
      sorting = request_json['ascending'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    if (request_json['page'] != null && request_json['page'] != undefined) {
      page = request_json['page'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json['limit'] != null && request_json['limit'] != undefined) {
      limit = request_json['limit'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json['keyword'] != null && request_json['keyword'] != undefined) {
      keyword = request_json['keyword'];
    }

    if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
      startdate = request_json["startdate"];

      var currentdate = new Date(new Date(request_json["enddate"]).setDate(new Date(request_json["enddate"]).getDate() + 1));
      var dateend = currentdate.toISOString().split("T")[0];
      enddate = dateend;
    }

    var data = await this.TemplatesService.pushnotif_listing(keyword, startdate, enddate, sorting, page, limit);
    var totaldata = await this.TemplatesService.pushnotif_listing(keyword, startdate, enddate, null, null, null);

    const messages = {
      "info": ["The process successful"],
    };

    return {
      response_code: 202,
      data: data,
      total: totaldata.length,
      messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing/push_notification/v2')
  async listing2(@Request() req) {
    var keyword = null;
    var startdate = null;
    var enddate = null;
    var sorting = null;
    var page = null;
    var limit = null;

    var request_json = JSON.parse(JSON.stringify(req.body));
    if (request_json['ascending'] != null && request_json['ascending'] != undefined) {
      sorting = request_json['ascending'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    if (request_json['page'] != null && request_json['page'] != undefined) {
      page = request_json['page'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json['limit'] != null && request_json['limit'] != undefined) {
      limit = request_json['limit'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    if (request_json['keyword'] != null && request_json['keyword'] != undefined) {
      keyword = request_json['keyword'];
    }

    if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
      startdate = request_json["startdate"];

      var currentdate = new Date(new Date(request_json["enddate"]).setDate(new Date(request_json["enddate"]).getDate() + 1));
      var dateend = currentdate.toISOString().split("T")[0];
      enddate = dateend;
    }

    var data = await this.TemplatesService.pushnotif_listing2(keyword, startdate, enddate, sorting, page, limit);
    var totaldata = await this.TemplatesService.pushnotif_listing2(keyword, startdate, enddate, null, null, null);

    const messages = {
      "info": ["The process successful"],
    };

    return {
      response_code: 202,
      data: data,
      total: totaldata.length,
      messages: messages,
    };
  }
}
