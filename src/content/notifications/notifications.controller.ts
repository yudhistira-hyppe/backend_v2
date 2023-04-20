import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationsDto } from './dto/create-notifications.dto';
import { Notifications } from './schemas/notifications.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
@Controller()
export class NotificationsController {
  constructor(private readonly NotificationsService: NotificationsService) { }

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
  async contentuserall(@Req() request: Request): Promise<any> {
    var skip = 0;
    var limit = 0;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

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

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    // let dataall = await this.NotificationsService.findAll();
    // var totalAllrows = dataall.length;


    let data = await this.NotificationsService.findlatest(email, skip, limit);

    return { response_code: 202, data, totalAllrows: 0, messages };
  }

  @Post('api/notifications/business/latest')
  @UseGuards(JwtAuthGuard)
  async contentuserallbybusiness(@Req() request: Request): Promise<any> {
    var skip = 0;
    var limit = 0;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));

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

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    // let dataall = await this.NotificationsService.findAll();
    // var totalAllrows = dataall.length;


    let data = await this.NotificationsService.findbusinesslatest(email, skip, limit);

    return { response_code: 202, data, totalAllrows: 0, messages };
  }
}
