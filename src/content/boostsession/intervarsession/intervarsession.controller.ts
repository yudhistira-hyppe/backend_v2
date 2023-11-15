import { Body, Controller, Headers, Get, HttpCode, HttpStatus, Param, Post,UseGuards } from '@nestjs/common';
import { IntervalSessionService } from './intervarsession.service';
import { BoostsessionDto } from '../dto/boostsession.dto';
import { Boostsession } from '../schemas/boostsession.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { BoostintervalService } from '../../boostinterval/boostinterval.service';
import { BoostintervalDto } from '../../boostinterval/dto/boostinterval.dto';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler'; 
import { BoostsessionService } from '../boostsession.service';
import { TransactionsService } from '../../../trans/transactions/transactions.service';
import { OyPgService } from '../../../paymentgateway/oypg/oypg.service';


@Controller()
export class IntervalSessionController {
  constructor(
    private readonly oyPgService: OyPgService,
    private readonly transactionsService: TransactionsService,
    private readonly intervalSessionService: IntervalSessionService,
    private readonly boostsessionService: BoostsessionService, 
    private readonly boostintervalService: BoostintervalService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler
  ) {}

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
    //CECK PENDING TRANSACTION
    var CountPending = 0;
    var daftarPending = await this.transactionsService.findPendingByUser(profile.iduser.toString());
    if ((await this.utilsService.ceckData(daftarPending))) {
      let cekstatusva = await this.oyPgService.staticVaInfo(daftarPending.idva);
      if (cekstatusva!=undefined){
        if (cekstatusva.va_status === "WAITING_PAYMENT") {
          CountPending=1;
        }
      }
    }
    var Response = {
      response_code: 202,
      data: {
        pendingTransaction: CountPending,
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

  @UseGuards(JwtAuthGuard)
  @Get('api/post/boostmaster/v2')
  @HttpCode(HttpStatus.ACCEPTED)
  async getData2(@Headers() headers) {
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
    var profile = await this.utilsService.generateProfile2(headers['x-auth-user'], "FULL");
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
    //CECK PENDING TRANSACTION
    var CountPending = 0;
    var daftarPending = await this.transactionsService.findPendingByUser(profile.iduser.toString());
    if ((await this.utilsService.ceckData(daftarPending))) {
      let cekstatusva = await this.oyPgService.staticVaInfo(daftarPending.idva);
      if (cekstatusva!=undefined){
        if (cekstatusva.va_status === "WAITING_PAYMENT") {
          CountPending=1;
        }
      }
    }
    var Response = {
      response_code: 202,
      data: {
        pendingTransaction: CountPending,
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
