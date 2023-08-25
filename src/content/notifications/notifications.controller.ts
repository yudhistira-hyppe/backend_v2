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
    private readonly logapiSS:LogapisService) { }

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
}
