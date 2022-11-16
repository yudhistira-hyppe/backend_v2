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

  @UseGuards(JwtAuthGuard)
  @Get('api/post/boostmaster')
  @HttpCode(HttpStatus.ACCEPTED)
  async getData(@Headers() headers) {
    if (headers['x-auth-user'] == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email header dan token not match',
      );
    }
    var profile = await this.utilsService.generateProfile(headers['x-auth-user'], "FULL");
    if (!(await this.utilsService.ceckData(profile))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
    const langIso = (profile.langIso != undefined) ? profile.langIso : "id";
    var BoostsessionDto_ = new BoostsessionDto();
    BoostsessionDto_.type = "manual";
    BoostsessionDto_.langIso = langIso;
    var BoostintervalDto_ = new BoostintervalDto();
    BoostintervalDto_.type = "manual";
    BoostintervalDto_.langIso = langIso;
    var interval_data = await this.boostintervalService.findWhere(BoostintervalDto_);
    var session_data = await this.boostsessionService.findWhere(BoostsessionDto_);
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
