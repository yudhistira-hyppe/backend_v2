import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { BoostintervalService } from './boostinterval.service';
import { BoostintervalDto } from './dto/boostinterval.dto';
import { Boostinterval } from './schemas/boostinterval.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/boostinterval')
export class BoostintervalController {
  constructor(private readonly boostintervalService: BoostintervalService) {}

  @Post()
  async create(@Body() BoostintervalDto_: BoostintervalDto) {
    await this.boostintervalService.create(BoostintervalDto_);
  }
}
