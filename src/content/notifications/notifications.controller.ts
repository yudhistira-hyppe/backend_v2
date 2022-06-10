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

    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }


    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.NotificationsService.findlatest(email);

    return { response_code: 202, data, messages };
  }


}
