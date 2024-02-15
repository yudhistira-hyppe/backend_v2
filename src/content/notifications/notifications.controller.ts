import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { Notifications } from './schemas/notifications.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { LogapisService } from 'src/trans/logapis/logapis.service';
@Controller()
export class NotificationsController {
  constructor(private readonly NotificationsService: NotificationsService,
    private readonly logapiSS: LogapisService) { }

  @Post()
  async create(@Body() CreateNotificationsDto: CreateNotificationsDto) {
    await this.NotificationsService.create(CreateNotificationsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Notifications[]> {
    return this.NotificationsService.findAll();
  }
  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Notifications> {
  //   return this.NotificationsService.findOne(id);
  // }

  @Get(':email')
  async findOneId(@Param('email') email: string): Promise<Notifications> {
    return this.NotificationsService.findOne(email);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.NotificationsService.delete(id);
  }



  @Post('api/notifications/latest')
  @UseGuards(JwtAuthGuard)
  async contentuserall(@Req() request: Request, @Headers() headers): Promise<any> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
    var fullurl = request.get("Host") + request.originalUrl;

    var skip = 0;
    var limit = 0;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    // let dataall = await this.NotificationsService.findAll();
    // var totalAllrows = dataall.length;


    let data = await this.NotificationsService.findlatest(email, skip, limit);

    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

    return { response_code: 202, data, totalAllrows: 0, messages };
  }

  @Post('api/notifications/business/latest')
  @UseGuards(JwtAuthGuard)
  async contentuserallbybusiness(@Req() request: Request): Promise<any> {
    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
    var fullurl = request.get("Host") + request.originalUrl;

    var skip = 0;
    var limit = 0;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    // let dataall = await this.NotificationsService.findAll();
    // var totalAllrows = dataall.length;


    let data = await this.NotificationsService.findbusinesslatest(email, skip, limit);

    var date = new Date();
    var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, request_json.email, null, null, request_json);

    return { response_code: 202, data, totalAllrows: 0, messages };
  }

  @Post('api/templates/listaudiens')
  @UseGuards(JwtAuthGuard)
  async listingaudiens(@Req() request: Request): Promise<any> {
    var templateid = null;
    var fullname = null;
    var gender = null;
    var minage = null;
    var maxage = null;
    var location = null;
    var accounttype = null;
    var sendstatus = null;
    var page = null;
    var limit = null;
    var ascending = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json['templateid'] != null && request_json['templateid'] != undefined) {
      templateid = request_json['templateid'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, templateid field is required");
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

    if (request_json['ascending'] != null && request_json['ascending'] != undefined) {
      ascending = request_json['ascending'];
    }
    else {
      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }

    if (request_json['fullname'] != null && request_json['fullname'] != undefined) {
      fullname = request_json['fullname'];
    }

    if (request_json['gender'] != null && request_json['gender'] != undefined) {
      gender = request_json['gender'];
    }

    if (request_json['minage'] != null && request_json['minage'] != undefined && request_json['maxage'] != null && request_json['maxage'] != undefined) {
      minage = request_json['minage'];
      maxage = request_json['maxage'];
    }

    if (request_json['location'] != null && request_json['location'] != undefined) {
      location = request_json['location'];
    }

    if (request_json['accounttype'] != null && request_json['accounttype'] != undefined) {
      accounttype = request_json['accounttype'];
    }

    if (request_json['sendstatus'] != null && request_json['sendstatus'] != undefined) {
      sendstatus = request_json['sendstatus'];
    }

    var data = await this.NotificationsService.listingtargetaudiens(templateid, fullname, gender, minage, maxage, location, accounttype, sendstatus, ascending, page, limit);

    const messages = {
      "info": ["The process successful"],
    };

    return {
      response_code: 202,
      data,
      messages
    }

  }

  @Post('api/templates/listaudiens/v2')
  @UseGuards(JwtAuthGuard)
  async listingaudiensv2(@Req() request: Request): Promise<any> {
    var templateid = null;
    var fullname = null;
    var gender = null;
    var minage = null;
    var maxage = null;
    var location = null;
    var accounttype = null;
    var sendstatus = null;
    var page = null;
    var limit = null;
    var ascending = null;

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json['templateid'] != null && request_json['templateid'] != undefined) {
      templateid = request_json['templateid'];
    }
    else {
      throw new BadRequestException("Unable to proceed, templateid field is required");
    }

    if (request_json['page'] != null && request_json['page'] != undefined) {
      page = request_json['page'];
    }
    else {
      throw new BadRequestException("Unable to proceed, page field is required");
    }

    if (request_json['limit'] != null && request_json['limit'] != undefined) {
      limit = request_json['limit'];
    }
    else {
      throw new BadRequestException("Unable to proceed, limit field is required");
    }

    if (request_json['ascending'] != null && request_json['ascending'] != undefined) {
      ascending = request_json['ascending'];
    }
    else {
      throw new BadRequestException("Unable to proceed, ascending field is required");
    }

    if (request_json['fullname'] != null && request_json['fullname'] != undefined) {
      fullname = request_json['fullname'];
    }

    if (request_json['gender'] != null && request_json['gender'] != undefined) {
      gender = request_json['gender'];
    }

    if (request_json['minage'] != null && request_json['minage'] != undefined && request_json['maxage'] != null && request_json['maxage'] != undefined) {
      minage = request_json['minage'];
      maxage = request_json['maxage'];
    }

    if (request_json['location'] != null && request_json['location'] != undefined) {
      location = request_json['location'];
    }

    if (request_json['accounttype'] != null && request_json['accounttype'] != undefined) {
      accounttype = request_json['accounttype'];
    }

    if (request_json['sendstatus'] != null && request_json['sendstatus'] != undefined) {
      sendstatus = request_json['sendstatus'];
    }

    var data = await this.NotificationsService.listingtargetaudiensv2(templateid, fullname, gender, minage, maxage, location, accounttype, sendstatus, ascending, page, limit);

    const messages = {
      "info": ["The process was successful"],
    };

    return {
      response_code: 202,
      data,
      messages
    }

  }
}
