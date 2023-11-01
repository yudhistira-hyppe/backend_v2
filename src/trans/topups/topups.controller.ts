import { Body, Controller, Post, UseGuards, Headers, UseInterceptors, UploadedFile } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TopupsService } from './topups.service';
import { Topups } from './schema/topups.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import mongoose from 'mongoose';
import { AccountbalancesService } from '../accountbalances/accountbalances.service';
import { CreateAccountbalancesDto } from '../accountbalances/dto/create-accountbalances.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('api/topups')
export class TopupsController {
  constructor(
    private readonly topupsService: TopupsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler, 
    private readonly userbasicsService: UserbasicsService, 
    private readonly userauthsService: UserauthsService, 
    private readonly accountbalancesService: AccountbalancesService,
    ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(@Body() Topups_: Topups, @Headers() headers) {
    var currentDate = await this.utilsService.getDateTimeISOString();
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    let dataUserbasics_login = await this.userbasicsService.findOne(headers['x-auth-user']);
    let dataUserauths_login = await this.userauthsService.findOne(headers['x-auth-user']);
    //VALIDASI PARAM email
    var ceckemail = await this.utilsService.validateParam("email", Topups_.email, "string")
    if (ceckemail != "") {
      await this.errorHandler.generateBadRequestException(
        ceckemail,
      );
    }
    //VALIDASI PARAM topup
    var cecktopup = await this.utilsService.validateParam("topup", Topups_.topup, "number")
    if (cecktopup != "") {
      await this.errorHandler.generateBadRequestException(
        cecktopup,
      );
    }
    let dataUserbasics = await this.userbasicsService.findOne(Topups_.email);
    let dataUserauths = await this.userauthsService.findOne(Topups_.email);
    if ((await this.utilsService.ceckData(dataUserbasics)) && (await this.utilsService.ceckData(dataUserauths))) {

      //PPH
      let pph = 0;
      if (Number(Topups_.topup) <= Number(2500000)) {
        pph = 0.05;
        console.log(pph);
      } else if ((Number(2500000) < Number(Topups_.topup)) && (Number(Topups_.topup) <= Number(30000000))) {
        pph = 0.15;
        console.log(pph);
      } else if ((Number(30000000) < Number(Topups_.topup)) && (Number(Topups_.topup) <= Number(62500000))) {
        pph = 0.25;
        console.log(pph);
      } else if ((Number(62500000) < Number(Topups_.topup)) && (Number(Topups_.topup) <= Number(150000000))) {
        pph = 0.3;
        console.log(pph);
      } else {
        pph = 0.3;
        console.log(pph);
      }

      //PPH CALCULATE
      let pphPrice = (Topups_.topup / 2) * pph;
      //TOT CALCULATE
      let tot = (Topups_.topup - pphPrice);

      Topups_._id = new mongoose.Types.ObjectId();
      Topups_.idUser = new mongoose.Types.ObjectId(dataUserbasics._id.toString());
      Topups_.username = dataUserauths.username;
      Topups_.pph = pphPrice;
      Topups_.total = tot;
      Topups_.approveByFinance = false;
      Topups_.approveByStrategy = false;
      Topups_.approve = false;
      Topups_.createBy = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
      Topups_.createByUsername = dataUserauths_login.username;
      Topups_.status = "NEW";
      Topups_.createdAt = currentDate;
      Topups_.updatedAt = currentDate; 
      Topups_.pphPersen = pph;
      const data = await this.topupsService.create(Topups_);

      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Create Data Topups succesfully", data
      );
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, User not found',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/approve')
  async approve(@Body() Topups_: Topups, @Headers() headers) {
    var currentDate = await this.utilsService.getDateTimeISOString();
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }
    let dataUserbasics_login = await this.userbasicsService.findOne(headers['x-auth-user']);

    //VALIDASI PARAM _id
    var ceck_id = await this.utilsService.validateParam("id", Topups_._id.toString(), "string")
    if (ceck_id != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_id,
      );
    }
    let dataTopups = await this.topupsService.findOne(Topups_._id.toString());
    if (await this.utilsService.ceckData(dataTopups)){
      Topups_.approve = false;
      if (Topups_.approveByFinance!=undefined){
        if (Topups_.approveByFinance && dataTopups.approveByStrategy){
          Topups_.approve = true;
          Topups_.status = "SUCCESS";
          Topups_.approveByFinanceDate = currentDate;
          Topups_.approveByFinanceUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        } else {
          Topups_.approveByFinanceDate = currentDate;
          Topups_.approveByFinanceUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        }
      }
      if (Topups_.approveByStrategy != undefined) {
        if (Topups_.approveByStrategy && dataTopups.approveByFinance) {
          Topups_.approve = true;
          Topups_.status = "APPROVE";
          Topups_.approveByStrategyDate = currentDate;
          Topups_.approveByStrategyUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        } else {
          Topups_.approveByStrategyDate = currentDate;
          Topups_.approveByStrategyUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        }
      }

      if (Topups_.approve){
        let CreateAccountbalancesDto_ = new CreateAccountbalancesDto();
        CreateAccountbalancesDto_.iduser = { oid: dataTopups.idUser.toString()};
        CreateAccountbalancesDto_.debet = 0;
        CreateAccountbalancesDto_.kredit = dataTopups.topup;
        CreateAccountbalancesDto_.type = "rewards";
        CreateAccountbalancesDto_.timestamp = await this.utilsService.getDateTimeISOString();
        CreateAccountbalancesDto_.description = "TOP UP";
        await this.accountbalancesService.create(CreateAccountbalancesDto_);
      }
      const dataId = Topups_._id.toString();
      Topups_._id = undefined;
      await this.topupsService.updateone(dataId, Topups_);

      return await this.errorHandler.generateAcceptResponseCode(
        "Update Data Topups succesfully"
      );
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Data not found',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/delete')
  async delete(@Body() Topups_: Topups, @Headers() headers) {
    var currentDate = await this.utilsService.getDateTimeString();
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }

    //VALIDASI PARAM _id
    var ceck_id = await this.utilsService.validateParam("id", Topups_._id.toString(), "string")
    if (ceck_id != "") {
      await this.errorHandler.generateBadRequestException(
        ceck_id,
      );
    }
    Topups_.status = "DELETE";
    Topups_.updatedAt = currentDate;
    const dataId = Topups_._id.toString();
    Topups_._id = undefined;
    await this.topupsService.updateone(dataId, Topups_);

    return await this.errorHandler.generateAcceptResponseCode(
      "Delete Data Topups succesfully",
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('/list')
  async list(@Body() body: any, @Headers() headers) {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }

    //----------------START DATE----------------
    let start_date = null;
    if (body.start_date != undefined) {
      start_date = new Date(body.start_date);
    }

    //----------------END DATE----------------
    let end_date = null;
    if (body.end_date != undefined) {
      end_date = new Date(body.end_date);
      end_date = new Date(end_date.setDate(end_date.getDate() + 1));
    }

    try{
      const topupsList = await this.topupsService.findCriteria(start_date, end_date, body.page, body.limit, body.search, body.createBy, body.status, body.sorting);
      return await this.errorHandler.generateAcceptResponseCodeWithData(
        "Get List succesfully", topupsList, topupsList.length, body.page
      );
    } catch (e) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed ' + e,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/import')
  @UseInterceptors(FileInterceptor('file'))
  async export(@UploadedFile() file: Express.Multer.File, @Headers() headers) {
    var currentDate = await this.utilsService.getDateTimeString();
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }

    //FUNCTION GET EXTENTION
    const getExtention = (async filename => {
      var extention = filename.substr(filename.lastIndexOf('.') + 1);
      return extention;
    });

    if (file!=undefined){
      if (file.mimetype == 'application/vnd.ms-excel' || file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const fileBuffer = file.buffer;
      } else {
        await this.errorHandler.generateBadRequestException("Unabled to proceed format file is required zip");
      }
    } else {
      await this.errorHandler.generateBadRequestException("Unabled to proceed file is required");
    }
  }
}
