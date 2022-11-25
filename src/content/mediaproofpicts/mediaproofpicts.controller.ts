import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
// import { FormDataRequest } from 'nestjs-form-data';
// import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
// import * as http from 'http';
// var FormData = require('form-data');
// var url = require("url");
// import * as fs from 'fs';
// import { join } from 'path';
// import { v4 as uuidv4 } from 'uuid';
// const multer = require('multer');

// var weedClient = require("node-seaweedfs");

// var server = process.env.SEAWEEDFS_HOST;
// var port = process.env.SEAWEEDFS_PORT;
// var BaseUrl = 'http://' + server + ':' + port;
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './upload');
//   },
//   filename: (req, file, cb) => {
//     var name = file.originalname;
//     var splitname = name.split('.');
//     const fileName = uuidv4() + '.' + splitname[1];
//     cb(null, fileName)
//   }
// });



@Controller('api/mediaproofpicts')
export class MediaproofpictsController {
  constructor(private readonly MediaproofpictsService: MediaproofpictsService) { }

  @Post()
  async create(@Body() CreateMediaproofpictsDto: CreateMediaproofpictsDto) {
    await this.MediaproofpictsService.create(CreateMediaproofpictsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Mediaproofpicts[]> {
    return this.MediaproofpictsService.findAll();
  }
  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Mediaproofpicts> {
    return this.MediaproofpictsService.findOne(id);
  }


  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.MediaproofpictsService.delete(id);
  }

  @Post('listkyc')
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var keys = null;
    var data = null;
    var page = null;
    var limit = null;
    var startdate = null;
    var enddate = null;
    var status = null;

    var descending = null;

    const messages = {
      "info": ["The process successful"],
    };
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    keys = request_json["keys"];
    status = request_json["status"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    descending = request_json["descending"];
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

    data = await this.MediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, page, limit);
    let datasearch = await this.MediaproofpictsService.listkyc(keys, status, startdate, enddate, descending, 0, 0);
    var totalsearch = datasearch.length;
    var allrow = await this.MediaproofpictsService.listkyc(undefined, undefined, undefined, undefined, descending, 0, 0);
    var totalallrow = allrow.length;
    var totalrow = data.length;

    var tpage = null;
    var tpage2 = null;
    var totalpage = null;
    tpage2 = (totalsearch / limit).toFixed(0);
    tpage = (totalsearch % limit);
    if (tpage > 0 && tpage < 5) {
      totalpage = parseInt(tpage2) + 1;

    } else {
      totalpage = parseInt(tpage2);
    }

    return { response_code: 202, data, page, limit, totalrow, totalallrow, totalsearch, totalpage, messages };
  }

  // @Post()
  // @UseInterceptors(FileFieldsInterceptor([
  //   {
  //     name: 'ktp',
  //     maxCount: 1,

  //   },
  //   { name: 'selfie', maxCount: 1 }

  // ], { storage: storage }),

  // )

  // uploadFile(@UploadedFiles() files: { ktp?: Express.Multer.File[], selfie?: Express.Multer.File[] }) {
  //   console.log(files);
  //   const file = fs.readFileSync('./upload/' + files.ktp[0].filename);

  //   return this.findseaweedfs(files.ktp[0], files.ktp[0].filename).then(function (finfo) {

  //     var proms = [];
  //     for (var i = 0; i < 1; i++) {
  //       proms.push(new Promise(function (resolve, reject) {
  //         var form = new FormData();
  //         var stream = typeof file === "string" ? fs.createReadStream(file) : null;
  //         form.append("file", stream ? stream : file);
  //         // var urlParts = url.parse("" + (self.usePublicUrl ? finfo.publicUrl : finfo.url) + "/" + finfo.fid + (opts.count == 1 ? "" : "_" + i));
  //         var urlParts = url.parse("http://172.16.0.4:9555/localrepo/testing/" + files.ktp[0].filename);
  //         var options = Object.assign({}, urlParts);

  //         console.log(options)
  //         // if (opts.headers) {
  //         //     options.headers = opts.headers;
  //         // }

  //         var req = form.submit(options, function (err, res) {
  //           if (err) {
  //             return reject(err);
  //           }
  //           resolve(res);
  //         });

  //         //we only check for self created streams, stream errors from outside streams should be handled outside
  //         if (stream) {
  //           stream.on("error", function (err) {
  //             reject(err);
  //           });
  //         }

  //         req.on("error", function (err) {
  //           reject(err);
  //         });

  //         req.on("socket", function (socket) {
  //           socket.on("error", function (err) {
  //             reject(err);
  //           });
  //         })
  //       }));
  //     }
  //     return Promise.all(proms).then(function () {
  //       return Promise.resolve(finfo);
  //     });

  //   });
  // }

  // async fileUpload(fileName: string) {
  //   // var weedClient = require('node-seaweedfs');

  //   // var seaweedfs = new weedClient({
  //   //   server: server,
  //   //   port: port

  //   // });

  //   // seaweedfs.write("./upload/" + fileName).then(function (fileInfo) {

  //   //   return seaweedfs.read(fileInfo.fid);
  //   // }).then(function (Buffer) {
  //   //   throw new BadRequestException(Buffer);
  //   // }).catch(function (err) {
  //   //   throw new BadRequestException(err);
  //   // });

  // }

  // async findseaweedfs(fileName: {}, name: string) {
  //   var self = this;
  //   return new Promise(function (resolve, reject) {
  //     var req = http.request(url.parse("http://172.16.0.4:9555/localrepo/testing/" + name), function (res) {

  //       let body = "";

  //       res.setEncoding('utf8');
  //       res.on("data", function (chunk) {
  //         body += chunk;
  //       });
  //       res.on("end", function () {
  //         var json = JSON.parse(JSON.stringify(body));
  //         return resolve(json);
  //       });
  //     });
  //     req.on("error", function (err) {
  //       return reject(err);
  //     });
  //     req.end();

  //   });
  // }
}
