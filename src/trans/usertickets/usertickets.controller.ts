import { Body, Controller, Headers, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, HttpCode, UseInterceptors, UploadedFiles, HttpException } from '@nestjs/common';
import { UserticketsService } from './usertickets.service';
import { CreateUserticketsDto } from './dto/create-usertickets.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { ErrorHandler } from "../../utils/error.handler";
import { isEmpty } from 'rxjs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UtilsService } from "../../utils/utils.service";
import { SeaweedfsService } from "../../stream/seaweedfs/seaweedfs.service";
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fse from 'fs-extra';
import * as fs from 'fs';
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
    private readonly seaweedfsService: SeaweedfsService) { }


  // @UseGuards(JwtAuthGuard)
  // @Post('api/usertickets/createticket')
  // async create(@Res() res, @Body() CreateUserticketsDto: CreateUserticketsDto, @Request() req) {
  //   const mongoose = require('mongoose');
  //   var ObjectId = require('mongodb').ObjectId;
  //   const messages = {
  //     "info": ["The create successful"],
  //   };

  //   const messagesEror = {
  //     "info": ["Todo is not found!"],
  //   };
  //   var reqdata = req.user;
  //   var email = reqdata.email;

  //   var datatiket = await this.userticketsService.findAll();
  //   var leng = datatiket.length + 1;

  //   var curdate = new Date(Date.now());
  //   var beforedate = curdate.toISOString();

  //   var substrtahun = beforedate.substring(0, 4);
  //   var numtahun = parseInt(substrtahun);



  //   var substrbulan = beforedate.substring(7, 5);
  //   var numbulan = parseInt(substrbulan);
  //   var substrtanggal = beforedate.substring(10, 8);
  //   var numtanggal = parseInt(substrtanggal);

  //   var rotahun = this.romawi(numtahun);
  //   var robulan = this.romawi(numbulan);
  //   var rotanggal = this.romawi(numtanggal);
  //   var angka = await this.generateNumber();
  //   var no = "HYPPE/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;

  //   var ubasic = await this.userbasicsService.findOne(email);

  //   var iduser = ubasic._id;
  //   var dt = new Date(Date.now());
  //   dt.setHours(dt.getHours() + 7); // timestamp
  //   dt = new Date(dt);

  //   var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
  //   var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
  //   var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
  //   CreateUserticketsDto.IdUser = iduser;
  //   CreateUserticketsDto.datetime = dt.toISOString();
  //   CreateUserticketsDto.nomortiket = no;
  //   CreateUserticketsDto.active = true;
  //   CreateUserticketsDto.categoryTicket = idcategory;
  //   CreateUserticketsDto.sourceTicket = idsource;
  //   CreateUserticketsDto.levelTicket = idlevel;

  //   try {
  //     let data = await this.userticketsService.create(CreateUserticketsDto);
  //     res.status(HttpStatus.OK).json({
  //       response_code: 202,
  //       "data": data,
  //       "message": messages
  //     });
  //   } catch (e) {
  //     res.status(HttpStatus.BAD_REQUEST).json({

  //       "message": messagesEror
  //     });
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/usertickets/createticket')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3 }], multerOptions))
  async upload(
    @UploadedFiles() files: {
      supportFile?: Express.Multer.File[],

    },
    // @UploadedFiles() files2: Array<Express.Multer.File>,
    @Body() CreateUserticketsDto: CreateUserticketsDto,
    @Headers() headers, @Res() res) {
    //  var idmediaproofpict = CreateMediaproofpictsDto_._id.toString();

    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    if (headers['x-auth-token'] == undefined) {
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
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
        var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
        var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
        CreateUserticketsDto.IdUser = iduser;
        CreateUserticketsDto.datetime = dt.toISOString();
        CreateUserticketsDto.nomortiket = no;
        CreateUserticketsDto.active = true;
        CreateUserticketsDto.categoryTicket = idcategory;
        CreateUserticketsDto.sourceTicket = idsource;
        CreateUserticketsDto.levelTicket = idlevel;
        datausertiket = await this.userticketsService.create(CreateUserticketsDto);
        var IdMediaproofpictsDto = datausertiket._id.toString();
        var objadsid = datausertiket._id;
        var paths = IdMediaproofpictsDto;
        var mongoose_gen_meida = paths;
        //Ceck supportFile
        if (files.supportFile != undefined) {
          var countfile = files.supportFile.length;

          for (var i = 0; i < countfile; i++) {
            var FormData_ = new FormData();
            supportFile_data = files.supportFile[i];
            supportFile_mimetype = files.supportFile[i].mimetype;
            supportFile_filename = files.supportFile[i].filename;
            supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
            supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

            //New Name file supportFile
            supportFile_filename_new = IdMediaproofpictsDto + '_000' + (i + 1) + '.' + supportFile_etx;
            //Rename Name file supportFile
            fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

            //Local path
            supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
            //SeaweedFs path
            supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/supportfile/';

            //Create Folder Id
            if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

              await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
            } else {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed create folder ' + mongoose_gen_meida,
              );
            }

            //Upload Seaweedfs
            try {
              FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
              await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
            } catch (err) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed proofpict failed upload seaweedfs',
              );
            }

            var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
            var objsname = supportFile_filename_new.replace('_000' + i, '');

            arrayUri.push(supportFile_filename_new);
            arrayName.push(supportFile_filename);
            arraySuri.push(objSuri);
            arraySname.push(objsname);
          }

          CreateUserticketsDto.mediaType = 'supportfile';
          CreateUserticketsDto.mediaBasePath = mongoose_gen_meida + '/supportfile/';
          CreateUserticketsDto.mediaUri = arrayUri;
          CreateUserticketsDto.originalName = arrayName;
          CreateUserticketsDto.fsSourceUri = arraySuri;
          CreateUserticketsDto.fsSourceName = arraySname;
          CreateUserticketsDto.fsTargetUri = arraySuri;
          CreateUserticketsDto.mediaMime = supportFile_mimetype;
          await this.userticketsService.updatedata(objadsid, CreateUserticketsDto);

          var data = await this.userticketsService.findOne(objadsid);



          //Delete directory recursively

          fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
            if (err) {
              throw err;
            }
          });

          res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": data,
            "message": messages
          });


        } else {
          res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": datausertiket,
            "message": messages
          });

        }

      } catch (err) {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed' + err,
        );
      }


    }
    else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed user not found',
      );
    }
  }

  @Post('api/usertickets/retrieveticket')
  @UseGuards(JwtAuthGuard)
  async retrieve(@Req() request: Request): Promise<any> {
    const mongoose = require('mongoose');
    var id = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["id"] !== undefined) {
      id = request_json["id"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    var idticket = mongoose.Types.ObjectId(request_json["id"]);
    const messages = {
      "info": ["The process successful"],
    };

    let data = await this.userticketsService.retrieve(idticket);

    return { response_code: 202, data, messages };
  }



  @Post('api/usertickets/list')
  @UseGuards(JwtAuthGuard)
  async search(@Req() request: Request): Promise<any> {
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
      throw new BadRequestException("Unabled to proceed");
    }

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

    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    const messages = {
      "info": ["The process successful"],
    };

    let dataall = await this.userticketsService.searchdataall(status, tipe);
    var totalallrow = dataall.length;


    let data = await this.userticketsService.searchdata(status, tipe, startdate, enddate, page, limit);
    var totalrow = data.length;
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
  async update(@Res() res, @Param('id') id: string, @Body() createUserticketsDto: CreateUserticketsDto) {
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
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put('api/usertickets/update/:id')
  async updatedata(@Res() res, @Param('id') id: string, @Body() CreateUserticketsDto: CreateUserticketsDto) {
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {

      var idcategory = mongoose.Types.ObjectId(CreateUserticketsDto.categoryTicket);
      var idsource = mongoose.Types.ObjectId(CreateUserticketsDto.sourceTicket);
      var idlevel = mongoose.Types.ObjectId(CreateUserticketsDto.levelTicket);
      var assignto = mongoose.Types.ObjectId(CreateUserticketsDto.assignTo);
      CreateUserticketsDto.active = true;
      CreateUserticketsDto.categoryTicket = idcategory;
      CreateUserticketsDto.sourceTicket = idsource;
      CreateUserticketsDto.levelTicket = idlevel;
      CreateUserticketsDto.assignTo = assignto;
      let data = await this.userticketsService.updatedata(id, CreateUserticketsDto);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  @Post('api/usertickets/filter')
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var search = null;
    var data = null;
    var skip = null;
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
    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    data = await this.userticketsService.filterdata(search, sumber, kategori, level, status, startdate, enddate, skip, limit);

    var allrow = await this.userticketsService.totalcount();
    var totalallrow = allrow[0].countrow;
    var totalrow = data.length;
    return { response_code: 202, data, skip, limit, totalrow, totalallrow, messages };
  }

  @Post('api/usertickets/count')
  @UseGuards(JwtAuthGuard)
  async countticket(): Promise<any> {
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
