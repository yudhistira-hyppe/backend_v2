import { Body, Controller, Headers, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, HttpCode, UseInterceptors, UploadedFiles, HttpException } from '@nestjs/common';
import { UserticketsService } from './usertickets.service';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { ErrorHandler } from "../../utils/error.handler";
import { isEmpty } from 'rxjs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UtilsService } from "../../utils/utils.service";
import { SeaweedfsService } from "../../stream/seaweedfs/seaweedfs.service";
import { SettingsService } from '../settings/settings.service';
import { LogticketsService } from '../logtickets/logtickets.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { CreateLogticketsDto } from '../logtickets/dto/create-logtickets.dto';
import { OssService } from "../../stream/oss/oss.service";
import { LogapisService } from '../logapis/logapis.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");

export const multerConfig = {
  // dest: process.env.PATH_UPLOAD,
  dest: './temp/'
};

export const multerOptions = {
  limits: {
    fileSize: +process.env.MAX_FILE_SIZE,
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
      cb(null, true);
    } else {
      cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
    }
  },
  storage: diskStorage({
    destination: (req: any, file: any, cb: any) => {
      const uploadPath = multerConfig.dest;
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req: any, file: any, cb: any) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, fileName)
    },
  }),
};
@Controller()
export class UserticketsController {
  constructor(private readonly userticketsService: UserticketsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly userbasicsService: UserbasicsService,
    private readonly settingsService: SettingsService,
    private readonly userauthsService: UserauthsService,
    private readonly seaweedfsService: SeaweedfsService,
    private readonly ossService: OssService,
    private readonly logticketsService: LogticketsService,
    private readonly logapiSS: LogapisService,
    private readonly basic2SS: UserbasicnewService) { }



  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/usertickets/createticket')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 4 }]))
  async upload(
    @UploadedFiles() files: {
      supportFile?: Express.Multer.File[],

    },
    // @UploadedFiles() files2: Array<Express.Multer.File>,
    @Body() CreateUserticketsDto: CreateUserticketsDto,
    @Headers() headers, @Res() res) {
    //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/createticket';
    var reqbody = JSON.parse(JSON.stringify(CreateUserticketsDto));

    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    if (headers['x-auth-token'] == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed email is required',
      );
    }


    var datausertiket = null;
    //Var supportFile
    let supportFile_data = null;
    let supportFile_filename = '';
    let supportFile_etx = '';
    let supportFile_mimetype = '';
    let supportFile_name = '';
    let supportFile_filename_new = '';
    let supportFile_local_path = '';
    let supportFile_seaweedfs_path = '';
    var arrayUri = [];
    var arrayName = [];
    var arraySuri = [];
    var arraySname = [];
    var auth = null;
    var os = null;
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The create successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    //Ceck User Userbasics
    const datauserbasicsService = await this.userbasicsService.findOne(
      headers['x-auth-user'],
    );

    if (await this.utilsService.ceckData(datauserbasicsService)) {
      // var mongoose_gen_meida = new mongoose.Types.ObjectId();

      //Update proofPict
      try {


        var email = headers['x-auth-user'];

        var datatiket = await this.userticketsService.findAll();
        var leng = datatiket.length + 1;

        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);
        var url_cardPict = null;



        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);

        var rotahun = this.romawi(numtahun);
        var robulan = this.romawi(numbulan);
        var rotanggal = this.romawi(numtanggal);
        var angka = await this.generateNumber();
        var no = "HYPPE/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        try {
          auth = await this.userauthsService.findOneByEmail(email);
          os = auth.loginSrc;
        } catch (e) {
          os = "";
        }
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var idversion = "62bbdb4ba7520000050077a7";
        var dataversion = await this.settingsService.findOne(idversion);
        var version = dataversion.value;
        var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
        var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
        var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
        var status = CreateUserticketsDto.status;
        CreateUserticketsDto.IdUser = iduser;
        CreateUserticketsDto.datetime = dt.toISOString();
        CreateUserticketsDto.nomortiket = no;
        CreateUserticketsDto.active = true;
        CreateUserticketsDto.categoryTicket = idcategory;
        CreateUserticketsDto.sourceTicket = idsource;
        CreateUserticketsDto.levelTicket = idlevel;
        CreateUserticketsDto.version = version;
        CreateUserticketsDto.OS = os;
        datausertiket = await this.userticketsService.create(CreateUserticketsDto);
        var IdMediaproofpictsDto = datausertiket._id.toString();
        var objadsid = datausertiket._id;
        var paths = IdMediaproofpictsDto;
        var mongoose_gen_meida = paths;

        let datalogticket = new CreateLogticketsDto();
        datalogticket.userId = iduser;
        datalogticket.createdAt = dt.toISOString();
        datalogticket.ticketId = objadsid;
        datalogticket.type = "change status";
        datalogticket.remark = "change status to " + status;
        await this.logticketsService.create(datalogticket);
        //Ceck supportFile
        if (files.supportFile != undefined) {
          var countfile = files.supportFile.length;

          for (var i = 0; i < countfile; i++) {

            var FormData_ = new FormData();
            supportFile_data = files.supportFile[i];
            supportFile_filename = files.supportFile[i].originalname;
            supportFile_etx = '.jpeg';
            supportFile_filename_new = IdMediaproofpictsDto + '_000' + (i + 1) + supportFile_etx;
            supportFile_mimetype = files.supportFile[i].mimetype;

            var result = await this.ossService.uploadFile(files.supportFile[i], iduser.toString() + "/ticket/supportfile/" + supportFile_filename_new);
            console.log(result)
            if (result != undefined) {
              if (result.res != undefined) {
                if (result.res.statusCode != undefined) {
                  if (result.res.statusCode == 200) {
                    url_cardPict = result.res.requestUrls[0];
                  } else {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                      'Unabled to proceed supportfile failed upload',
                    );
                  }
                } else {
                  var timestamps_end = await this.utilsService.getDateTimeString();
                  this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                  await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportfile failed upload',
                  );
                }
              } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                  'Unabled to proceed supportfile failed upload',
                );
              }
            } else {
              var timestamps_end = await this.utilsService.getDateTimeString();
              this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed supportfile failed upload',
              );
            }
            var pathnew = iduser.toString() + '/ticket/supportfile/' + supportFile_filename_new
            arrayUri.push(pathnew);
            arrayName.push(supportFile_filename);
            arraySuri.push(url_cardPict);
            arraySname.push(supportFile_filename);
          }

          CreateUserticketsDto.mediaType = 'supportfile';
          CreateUserticketsDto.mediaBasePath = mongoose_gen_meida + '/supportfile/';
          CreateUserticketsDto.UploadSource = "OSS";
          CreateUserticketsDto.mediaUri = arrayUri;
          CreateUserticketsDto.originalName = arrayName;
          CreateUserticketsDto.fsSourceUri = arraySuri;
          CreateUserticketsDto.fsSourceName = arraySname;
          CreateUserticketsDto.fsTargetUri = arraySuri;
          CreateUserticketsDto.mediaMime = supportFile_mimetype;
          await this.userticketsService.updatedata(objadsid, CreateUserticketsDto);

          var data = await this.userticketsService.findOne(objadsid);

          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

          return res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": data,
            "message": messages
          });


        } else {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

          return res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": datausertiket,
            "message": messages
          });

        }

      } catch (err) {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed' + err,
        );
      }


    }
    else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
  }

  @Post('api/usertickets/retrieveticket')
  @UseGuards(JwtAuthGuard)
  async retrieve(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/retrieveticket';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    const mongoose = require('mongoose');
    var id = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["id"] !== undefined) {
      id = request_json["id"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var idticket = mongoose.Types.ObjectId(request_json["id"]);
    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.userticketsService.retrieve(idticket);

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, messages };
  }

  @Post('api/usertickets/list')
  @UseGuards(JwtAuthGuard)
  async search(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/list';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var status = null;
    var tipe = null;
    var startdate = null;
    var enddate = null;

    var page = 0;
    var limit = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["status"] !== undefined) {
      status = request_json["status"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["tipe"] !== undefined) {
      tipe = request_json["tipe"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    const messages = {
      "info": ["The process successful"],
    };

    let dataall = await this.userticketsService.searchdataall(status, tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.searchdata(status, tipe, startdate, enddate, page, limit);
    var totalrow = data.length;

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
  }

  @Post('api/usertickets/allticket')
  @UseGuards(JwtAuthGuard)
  async alltiket(@Req() request: Request): Promise<any> {
    var startdate = null;
    var enddate = null;
    var tipe = null;
    var page = 0;
    var limit = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["tipe"] !== undefined) {
      tipe = request_json["tipe"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    let dataall = await this.userticketsService.all(tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.alldatatiket(tipe, startdate, enddate, page, limit);
    if (!data) {
      throw new Error('Todo is not found!');
    }
    var totalrow = data.length;
    return { response_code: 202, data, page, limit, totalrow, totalallrow, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/:id')
  async update(@Res() res, @Param('id') id: string, @Body() createUserticketsDto: CreateUserticketsDto, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    var idobj = mongoose.Types.ObjectId(id);
    try {
      let data = await this.userticketsService.delete(idobj);

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/update/:id')
  async updatedata(@Res() res, @Param('id') id: string, @Req() request: Request, @Headers() headers, @Body() CreateUserticketsDto: CreateUserticketsDto) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/update/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var email = headers['x-auth-user'];

    var ubasic = await this.userbasicsService.findOne(email);

    var iduser = ubasic._id;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var request_json = JSON.parse(JSON.stringify(request.body));
    var categoryTicket = null;
    var sourceTicket = null;
    var levelTicket = null;
    var assignTo = null;
    var idcategory = null;
    var idsource = null;
    var idlevel = null;
    var assignto = null;
    var idusertiket = null;
    var remark = null;
    var userasign = null;
    var emailassign = null;
    var status = CreateUserticketsDto.status;
    try {
      if (request_json["categoryTicket"] !== undefined) {
        categoryTicket = request_json["categoryTicket"];
        idcategory = mongoose.Types.ObjectId(categoryTicket);
        CreateUserticketsDto.categoryTicket = idcategory;
      } else {

      }
      if (request_json["sourceTicket"] !== undefined) {
        sourceTicket = request_json["sourceTicket"];
        idsource = mongoose.Types.ObjectId(sourceTicket);
        CreateUserticketsDto.sourceTicket = idsource;
      } else {

      }

      if (request_json["levelTicket"] !== undefined) {
        levelTicket = request_json["levelTicket"];
        idlevel = mongoose.Types.ObjectId(levelTicket);
        CreateUserticketsDto.levelTicket = idlevel;
      } else {

      }

      if (request_json["assignTo"] !== undefined) {
        assignTo = request_json["assignTo"];
        assignto = mongoose.Types.ObjectId(assignTo);
        CreateUserticketsDto.assignTo = assignto;
        userasign = await this.userbasicsService.findbyid(assignTo);
        emailassign = userasign.email;
        remark = "change status to " + status + " and change assign to " + emailassign;
      } else {
        remark = "change status to " + status;
      }

      var idusertiket = mongoose.Types.ObjectId(id);
      var status = CreateUserticketsDto.status;
      let data = await this.userticketsService.updatedata(id, CreateUserticketsDto);

      let datalogticket = new CreateLogticketsDto();
      datalogticket.userId = iduser;
      datalogticket.createdAt = dt.toISOString();
      datalogticket.ticketId = idusertiket;
      datalogticket.type = "change status";
      datalogticket.remark = remark;
      await this.logticketsService.create(datalogticket);

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/update/v2/:id')
  async updatedatav2(@Res() res, @Param('id') id: string, @Req() request: Request, @Headers() headers, @Body() CreateUserticketsDto: CreateUserticketsDto) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/update/' + id;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update was successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    var email = headers['x-auth-user'];

    var ubasic = await this.basic2SS.findBymail(email);

    var iduser = ubasic._id;
    var dt = new Date(Date.now());
    dt.setHours(dt.getHours() + 7); // timestamp
    dt = new Date(dt);

    var request_json = JSON.parse(JSON.stringify(request.body));
    var categoryTicket = null;
    var sourceTicket = null;
    var levelTicket = null;
    var assignTo = null;
    var idcategory = null;
    var idsource = null;
    var idlevel = null;
    var assignto = null;
    var idusertiket = null;
    var remark = null;
    var userasign = null;
    var emailassign = null;
    var status = CreateUserticketsDto.status;
    try {
      if (request_json["categoryTicket"] !== undefined) {
        categoryTicket = request_json["categoryTicket"];
        idcategory = mongoose.Types.ObjectId(categoryTicket);
        CreateUserticketsDto.categoryTicket = idcategory;
      } else {

      }
      if (request_json["sourceTicket"] !== undefined) {
        sourceTicket = request_json["sourceTicket"];
        idsource = mongoose.Types.ObjectId(sourceTicket);
        CreateUserticketsDto.sourceTicket = idsource;
      } else {

      }

      if (request_json["levelTicket"] !== undefined) {
        levelTicket = request_json["levelTicket"];
        idlevel = mongoose.Types.ObjectId(levelTicket);
        CreateUserticketsDto.levelTicket = idlevel;
      } else {

      }

      if (request_json["assignTo"] !== undefined) {
        assignTo = request_json["assignTo"];
        assignto = mongoose.Types.ObjectId(assignTo);
        CreateUserticketsDto.assignTo = assignto;
        userasign = await this.userbasicsService.findbyid(assignTo);
        emailassign = userasign.email;
        remark = "change status to " + status + " and change assign to " + emailassign;
      } else {
        remark = "change status to " + status;
      }

      var idusertiket = mongoose.Types.ObjectId(id);
      var status = CreateUserticketsDto.status;
      let data = await this.userticketsService.updatedata(id, CreateUserticketsDto);

      let datalogticket = new CreateLogticketsDto();
      datalogticket.userId = mongoose.Types.ObjectId(iduser.toString());
      datalogticket.createdAt = dt.toISOString();
      datalogticket.ticketId = idusertiket;
      datalogticket.type = "change status";
      datalogticket.remark = remark;
      await this.logticketsService.create(datalogticket);

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      return res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @Post('api/usertickets/filter')
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/filter';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    var search = null;
    var data = null;
    var page = null;
    var limit = null;
    var countrow = null;
    var startdate = null;
    var enddate = null;
    var sumber = null;
    var level = null;
    var status = null;
    var sort = null;
    var order = null;
    var kategori = null;
    var startdate = null;
    var enddate = null;
    var assignto = null;
    var descending = null;
    var iduser = null;
    var close = null;

    const messages = {
      "info": ["The process successful"],
    };
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    sumber = request_json["sumber"];
    kategori = request_json["kategori"];
    level = request_json["level"];
    search = request_json["search"];
    status = request_json["status"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    assignto = request_json["assignto"];
    descending = request_json["descending"];
    iduser = request_json["iduser"];
    close = request_json["close"];
    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    try {
      data = await this.userticketsService.filterdata(search, assignto, sumber, kategori, level, status, startdate, enddate, page, limit, descending, iduser, close);
    } catch (e) {
      data = null;
    }


    var total = null;
    var totalsearch = null;
    var totalallrow = null;
    var totalpage = null;
    var datasearch = null;
    var dataall = null;
    total = data.length;

    // try {
    //   datasearch = await this.userticketsService.filterdatacount(search, assignto, sumber, kategori, level, status, startdate, enddate, iduser, close);
    //   totalsearch = datasearch[0].count;
    // } catch (e) {
    //   datasearch = null;
    //   totalsearch = 0;
    // }

    // try {
    //   dataall = await this.userticketsService.filterdatacount(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    //   totalallrow = dataall[0].count;
    // } catch (e) {
    //   totalallrow = 0;
    // }


    // var tpage = null;
    // var tpage2 = null;

    // tpage2 = (totalsearch / limit).toFixed(0);
    // tpage = (totalsearch % limit);
    // if (tpage > 0 && tpage < 5) {
    //   totalpage = parseInt(tpage2) + 1;

    // } else {
    //   totalpage = parseInt(tpage2);
    // }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };

  }

  @Post('api/usertickets/filter/v2')
  @UseGuards(JwtAuthGuard)
  async profileuser2(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/filter/v2';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    var search = null;
    var data = null;
    var page = null;
    var limit = null;
    var countrow = null;
    var startdate = null;
    var enddate = null;
    var sumber = null;
    var level = null;
    var status = null;
    var sort = null;
    var order = null;
    var kategori = null;
    var startdate = null;
    var enddate = null;
    var assignto = null;
    var descending = null;
    var iduser = null;
    var close = null;

    const messages = {
      "info": ["The process successful"],
    };
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    sumber = request_json["sumber"];
    kategori = request_json["kategori"];
    level = request_json["level"];
    search = request_json["search"];
    status = request_json["status"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    assignto = request_json["assignto"];
    descending = request_json["descending"];
    iduser = request_json["iduser"];
    close = request_json["close"];
    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    try {
      data = await this.userticketsService.filterdata2(search, assignto, sumber, kategori, level, status, startdate, enddate, page, limit, descending, iduser, close);
    } catch (e) {
      data = null;
    }


    var total = null;
    var totalsearch = null;
    var totalallrow = null;
    var totalpage = null;
    var datasearch = null;
    var dataall = null;
    total = data.length;

    // try {
    //   datasearch = await this.userticketsService.filterdatacount(search, assignto, sumber, kategori, level, status, startdate, enddate, iduser, close);
    //   totalsearch = datasearch[0].count;
    // } catch (e) {
    //   datasearch = null;
    //   totalsearch = 0;
    // }

    // try {
    //   dataall = await this.userticketsService.filterdatacount(undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
    //   totalallrow = dataall[0].count;
    // } catch (e) {
    //   totalallrow = 0;
    // }


    // var tpage = null;
    // var tpage2 = null;

    // tpage2 = (totalsearch / limit).toFixed(0);
    // tpage = (totalsearch % limit);
    // if (tpage > 0 && tpage < 5) {
    //   totalpage = parseInt(tpage2) + 1;

    // } else {
    //   totalpage = parseInt(tpage2);
    // }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };

  }

  @Post('api/usertickets/count')
  @UseGuards(JwtAuthGuard)
  async countticket(@Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/usertickets/count';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var datanew = null;
    var dataprogres = null;
    var dataclose = null;
    var allrow = null;
    var totalallrow = null;
    var totalnew = null;
    var totalprogress = null;
    var totalclose = null;
    var prosentaseNew = null;
    var prosentaseProgress = null;
    var prosentaseClose = null;
    const messages = {
      "info": ["The process successful"],
    };
    try {
      allrow = await this.userticketsService.totalcount();
      totalallrow = allrow[0].countrow;

    } catch (e) {
      allrow = null;
      totalallrow = 0;
    }
    try {

      datanew = await this.userticketsService.totalcountNew();
      totalnew = datanew[0].countrow;
      prosentaseNew = ((totalnew * 100) / totalallrow).toFixed(1);

    } catch (e) {
      datanew = null;
      totalnew = 0;
      prosentaseNew = 0;
    }

    try {

      dataprogres = await this.userticketsService.totalcountOnProgres();
      totalprogress = dataprogres[0].countrow;
      prosentaseProgress = ((totalprogress * 100) / totalallrow).toFixed(1);

    } catch (e) {
      dataprogres = null;
      totalprogress = 0;
      prosentaseProgress = 0;
    }

    try {

      dataclose = await this.userticketsService.totalcountClose();
      totalclose = dataclose[0].countrow;
      prosentaseClose = ((totalclose * 100) / totalallrow).toFixed(1);
    } catch (e) {

      dataclose = null
      totalclose = 0;
      prosentaseClose = 0;
    }

    var data = {
      "all": totalallrow,
      "new": totalnew,
      "prosentaseNew": prosentaseNew,
      "onprogress": totalprogress,
      "prosentaseProgress": prosentaseProgress,
      "close": totalclose,
      "prosentaseClose": prosentaseClose,
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return { response_code: 202, data, messages };
  }


  async romawi(num: number) {
    if (typeof num !== 'number')
      return false;

    var roman = {
      M: 1000,
      CM: 900,
      D: 500,
      CD: 400,
      C: 100,
      XC: 90,
      L: 50,
      XL: 40,
      X: 10,
      IX: 9,
      V: 5,
      IV: 4,
      I: 1
    };
    var str = '';

    for (var i of Object.keys(roman)) {
      var q = Math.floor(num / roman[i]);
      num -= q * roman[i];
      str += i.repeat(q);
    }

    return str;
  }

  async generateNumber() {
    const getRandomId = (min = 0, max = 500000) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      return num.toString().padStart(6, "0")
    };
    return getRandomId();
  }
}
