import { Body, Controller, Headers, Get, HttpCode, HttpStatus, Param, Post, UseGuards, Req } from '@nestjs/common';
import { BoostsessionService } from './boostsession.service';
import { BoostsessionDto } from './dto/boostsession.dto';
import { Boostsession } from './schemas/boostsession.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BoostintervalService } from '../boostinterval/boostinterval.service';
import { BoostintervalDto } from '../boostinterval/dto/boostinterval.dto';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('api/boostsession')
export class BoostsessionController {
  constructor(
    private readonly boostsessionService: BoostsessionService,
    private readonly boostintervalService: BoostintervalService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly logapiSS : LogapisService
  ) { }

  @Post()
  async create(@Body() BoostsessionDto_: BoostsessionDto) {
    await this.boostsessionService.create(BoostsessionDto_);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req, @Headers() headers): Promise<Boostsession[]> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    var data = await this.boostsessionService.findAll();

    var fullurl = req.get("Host") + req.originalUrl;
    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

    return data;
  }
}
