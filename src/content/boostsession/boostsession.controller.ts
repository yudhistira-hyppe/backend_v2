import { Body, Controller, Headers, Get, HttpCode, HttpStatus, Param, Post,UseGuards } from '@nestjs/common';
import { BoostsessionService } from './boostsession.service';
import { BoostsessionDto } from './dto/boostsession.dto';
import { Boostsession } from './schemas/boostsession.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { BoostintervalService } from '../boostinterval/boostinterval.service';
import { BoostintervalDto } from '../boostinterval/dto/boostinterval.dto';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';


@Controller()
export class BoostsessionController {
  constructor(
    private readonly boostsessionService: BoostsessionService, 
    private readonly boostintervalService: BoostintervalService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler
  ) {}

  @Post()
  async create(@Body() BoostsessionDto_: BoostsessionDto) {
    await this.boostsessionService.create(BoostsessionDto_);
  }
}
