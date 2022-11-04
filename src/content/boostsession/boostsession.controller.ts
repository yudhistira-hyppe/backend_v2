import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { BoostsessionService } from './boostsession.service';
import { BoostsessionDto } from './dto/boostsession.dto';
import { Boostsession } from './schemas/boostsession.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BoostintervalService } from '../boostinterval/boostinterval.service';


@Controller()
export class BoostsessionController {
  constructor(
    private readonly boostsessionService: BoostsessionService, 
    private readonly boostintervalService: BoostintervalService
  ) {}

  @Post()
  async create(@Body() BoostsessionDto_: BoostsessionDto) {
    await this.boostsessionService.create(BoostsessionDto_);
  }

  @Get('api/post/boostmaster')
  async getData() {
    var interval_data = await this.boostintervalService.findAll();
    var session_data = await this.boostsessionService.findAll();
    var Response = {
      response_code: 202,
      data: {
        interval: interval_data,
        session: session_data,
      },
      messages: {
        info: [
          "Succesfully"
        ]
      }
    }
    return Response;
  }
}
