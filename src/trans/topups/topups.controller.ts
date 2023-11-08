import { Body, Controller, Post, UseGuards, Headers, UseInterceptors, UploadedFile, Get, HttpCode, Res, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { TopupsService } from './topups.service';
import { Topups } from './schema/topups.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import mongoose from 'mongoose';
import { AccountbalancesService } from '../accountbalances/accountbalances.service';
import { CreateAccountbalances } from '../accountbalances/dto/create-accountbalances.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Controller('api/topups')
export class TopupsController {
  constructor(
    private readonly topupsService: TopupsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler, 
    private readonly userbasicsService: UserbasicsService, 
    private readonly userauthsService: UserauthsService, 
    private readonly accountbalancesService: AccountbalancesService,
    private readonly configService: ConfigService,
    ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  async create(@Body() Topups_: Topups, @Headers() headers) {
    var currentDate = await this.utilsService.getDateTimeISOString();
    let data = null;
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
    let dataUserbasics = await this.userbasicsService.findOne((Topups_.email.toString()).toLowerCase());
    let dataUserauths = await this.userauthsService.findOne((Topups_.email.toString()).toLowerCase());
    if ((await this.utilsService.ceckData(dataUserbasics)) && (await this.utilsService.ceckData(dataUserauths))) {
      Topups_._id = new mongoose.Types.ObjectId();
      Topups_.idUser = new mongoose.Types.ObjectId(dataUserbasics._id.toString());
      Topups_.username = dataUserauths.username;
      Topups_.createBy = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
      Topups_.createByUsername = dataUserauths_login.username;
      Topups_.createdAt = currentDate;
      Topups_.updatedAt = currentDate;
      Topups_.email = (Topups_.email.toString()).toLowerCase();
      let ceckData = await this.getDataTopup(Topups_);

      if (ceckData.status) {
        Topups_ = ceckData.Topups;
        data = await this.topupsService.create(Topups_);
      }
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
          Topups_.status = "PROCESS";
          Topups_.approveByFinanceDate = currentDate;
          Topups_.approveByFinanceUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        }
      }
      if (Topups_.approveByStrategy != undefined) {
        if (Topups_.approveByStrategy && dataTopups.approveByFinance) {
          Topups_.approve = true;
          Topups_.status = "SUCCESS";
          Topups_.approveByStrategyDate = currentDate;
          Topups_.approveByStrategyUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        } else {
          Topups_.status = "PROCESS";
          Topups_.approveByStrategyDate = currentDate;
          Topups_.approveByStrategyUserId = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
          Topups_.updatedAt = currentDate;
        }
      }

      if (Topups_.approve){
        let CreateAccountbalancesDto_ = new CreateAccountbalances();
        CreateAccountbalancesDto_.iduser = new mongoose.Types.ObjectId(dataTopups.idUser.toString());
        CreateAccountbalancesDto_.debet = 0;
        CreateAccountbalancesDto_.kredit = dataTopups.total;
        CreateAccountbalancesDto_.type = "rewards";
        CreateAccountbalancesDto_.timestamp = await this.utilsService.getDateTimeISOString();
        CreateAccountbalancesDto_.description = "TOP UP";
        await this.accountbalancesService.create_new(CreateAccountbalancesDto_);
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
    const XLSX = require('xlsx')
    var currentDate = await this.utilsService.getDateTimeISOString();
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unauthorized',
      );
    }

    let dataUserbasics_login = await this.userbasicsService.findOne(headers['x-auth-user']);
    let dataUserauths_login = await this.userauthsService.findOne(headers['x-auth-user']);

    if (file!=undefined){
      if (file.mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.mimetype == 'application/vnd.ms-excel') {
        const fileBuffer = file.buffer;
        let wb = XLSX.read(fileBuffer, { type: "buffer" });

        let dataArray = [];
        const sheets = wb.SheetNames;
        for (let i = 0; i < sheets.length; i++) {
          const temp = XLSX.utils.sheet_to_json(
          wb.Sheets[wb.SheetNames[i]])
          temp.forEach((res) => {
            dataArray.push(res)
          })
        } 

        let CountSucces = 0;
        if (dataArray.length>0){
          for (let u = 0; u < dataArray.length; u++) {
            let dataGet = dataArray[u];
            if ((dataGet.Email != undefined) && (dataGet.Topup != undefined)){
              let dataUserbasics = await this.userbasicsService.findOne((dataGet.Email.toString()).toLowerCase());
              let dataUserauths = await this.userauthsService.findOne((dataGet.Email.toString()).toLowerCase());
              let Topups_ = new Topups();
              if ((await this.utilsService.ceckData(dataUserbasics)) && (await this.utilsService.ceckData(dataUserauths))) {
                Topups_._id = new mongoose.Types.ObjectId();
                Topups_.idUser = new mongoose.Types.ObjectId(dataUserbasics._id.toString());
                Topups_.username = dataUserauths.username;
                Topups_.createBy = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
                Topups_.createByUsername = dataUserauths_login.username;
                Topups_.createdAt = currentDate;
                Topups_.updatedAt = currentDate; 
                Topups_.topup = dataGet.Topup;
                Topups_.email = (dataGet.Email.toString()).toLowerCase();
                let ceckData = await this.getDataTopup(Topups_);

                if (ceckData.status) {
                  Topups_ = ceckData.Topups;
                  const data = await this.topupsService.create(Topups_);
                  CountSucces++;
                }
              }else{
                Topups_._id = new mongoose.Types.ObjectId();
                Topups_.createBy = new mongoose.Types.ObjectId(dataUserbasics_login._id.toString());
                Topups_.createByUsername = dataUserauths_login.username;
                Topups_.createdAt = currentDate;
                Topups_.updatedAt = currentDate;
                Topups_.topup = dataGet.Topup;
                Topups_.email = (dataGet.Email.toString()).toLowerCase();
                let ceckData = await this.getDataTopup(Topups_);

                if (ceckData.status) {
                  Topups_ = ceckData.Topups;
                  Topups_.status = "FAILED";
                  const data = await this.topupsService.create(Topups_);
                } else {
                  Topups_ = ceckData.Topups;
                  Topups_.status = "FAILED";
                  const data = await this.topupsService.create(Topups_);
                }
              }
            }
          }
        }

        let dataResponse = {
          length: dataArray.length,
          succes: CountSucces,
          failed: dataArray.length - CountSucces,
          data: dataArray,
        }

        return await this.errorHandler.generateAcceptResponseCodeWithData(
          "Create Data Topups succesfully", dataResponse
        );
      } else {
        await this.errorHandler.generateBadRequestException("Unabled to proceed format file is required zip");
      }
    } else {
      await this.errorHandler.generateBadRequestException("Unabled to proceed file is required");
    }
  }

  async getDataTopup(Topups_: Topups){
    try{
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
      let pphPrice = <any>((Topups_.topup / 2) * pph);
      //TOT CALCULATE
      let tot = <any>(Topups_.topup - pphPrice);

      Topups_._id = new mongoose.Types.ObjectId();
      Topups_.pph = pphPrice;
      Topups_.total = tot;
      Topups_.approveByFinance = false;
      Topups_.approveByStrategy = false;
      Topups_.approve = false;
      Topups_.status = "NEW";
      Topups_.pphPersen = <any>pph;
      return {
        status: true,
        Topups: Topups_
      }
    } catch (e) {
      Topups_._id = new mongoose.Types.ObjectId();
      Topups_.pph = 0;
      Topups_.total = 0;
      Topups_.approveByFinance = false;
      Topups_.approveByStrategy = false;
      Topups_.approve = false;
      Topups_.status = "FAILED";
      return {
        status:false,
        Topups: Topups_
      }
    }
  }
  
  @Get('file/download/')
  @HttpCode(HttpStatus.OK)
  async downloadFile(@Res() response) {
    const BASE_PATH = this.configService.get("PATH_UPLOAD");

    var file = fs.createReadStream(BASE_PATH +"sample/topup/topup_example.xlsx");
    var stat = fs.statSync(BASE_PATH + "sample/topup/topup_example.xlsx");
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    response.setHeader('Content-Disposition', 'attachment; filename=topup_example.xlsx');
    file.pipe(response);
  }
  
}
