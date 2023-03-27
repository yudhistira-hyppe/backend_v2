import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res, UseInterceptors, UploadedFiles, Req } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OssService } from '../../stream/oss/oss.service';

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
  constructor(private readonly MediaproofpictsService: MediaproofpictsService,
    private readonly ossService: OssService, 
  ) { }

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

  @Post("/move/oss")
  async moveOss() {
    var OSS_path = "http://be-production.oss-ap-southeast-5.aliyuncs.com/";
    var mediaproofpicts = await this.MediaproofpictsService.findByOssName("be-staging");
    console.log(mediaproofpicts.length);
    for (var i = 0; i < mediaproofpicts.length;i++){
      var mediaproofpicts_mediaBasePath = mediaproofpicts[i].mediaBasePath.toString();
      var mediaproofpicts_mediaSelfieBasePath = mediaproofpicts[i].mediaSelfieBasePath.toString(); 
      var mediaproofpicts_SupportfsSourceUri = mediaproofpicts[i].mediaSupportUri;
      
      var mediaproofpicts_fsSourceUri = OSS_path + mediaproofpicts_mediaBasePath;
      var mediaproofpicts_SelfiefsSourceUri = OSS_path + mediaproofpicts_mediaSelfieBasePath;

      console.log("KTP FILE", mediaproofpicts_fsSourceUri);
      console.log("SELFI FILE", mediaproofpicts_SelfiefsSourceUri);

      var buffer_mediaproofpicts_mediaBasePath = await this.ossService.readFile(mediaproofpicts_mediaBasePath);
      var upload_mediaproofpicts_mediaBasePath = await this.ossService.uploadFileBuffer2(Buffer.from(buffer_mediaproofpicts_mediaBasePath), mediaproofpicts_mediaBasePath);

      var buffer_mediaproofpicts_mediaSelfieBasePath = await this.ossService.readFile(mediaproofpicts_mediaSelfieBasePath);
      var upload_mediaproofpicts_mediaSelfieBasePath = await this.ossService.uploadFileBuffer2(Buffer.from(buffer_mediaproofpicts_mediaSelfieBasePath), mediaproofpicts_mediaSelfieBasePath);

      var array_support_file = [];
      if (mediaproofpicts_SupportfsSourceUri.length > 0) {
        console.log("-----START-----");
        for (var j = 0; j < mediaproofpicts_SupportfsSourceUri.length; j++) {
          var mediaproofpicts_SupportfsSourceUri_mediaBasePath = mediaproofpicts_SupportfsSourceUri[j];
          var buffer_mediaproofpicts_SupportfsSourceUri_mediaBasePath = await this.ossService.readFile(mediaproofpicts_SupportfsSourceUri_mediaBasePath);
          var upload_mediaproofpicts_SupportfsSourceUri_mediaBasePath = await this.ossService.uploadFileBuffer2(Buffer.from(buffer_mediaproofpicts_SupportfsSourceUri_mediaBasePath), mediaproofpicts_SupportfsSourceUri_mediaBasePath);
          array_support_file.push(OSS_path + mediaproofpicts_SupportfsSourceUri_mediaBasePath);
        }
        console.log("SUPPORT FILE",array_support_file);
        console.log("-----END-----");
      }else{
          console.log("mediaproofpicts_SupportfsSourceUri",0);
      }

      var CreateMediaproofpictsDto_ = new CreateMediaproofpictsDto();
      CreateMediaproofpictsDto_.fsSourceUri = mediaproofpicts_fsSourceUri;
      CreateMediaproofpictsDto_.fsTargetUri = mediaproofpicts_fsSourceUri;

      CreateMediaproofpictsDto_.SelfiefsSourceUri = mediaproofpicts_SelfiefsSourceUri;
      CreateMediaproofpictsDto_.SelfiefsTargetUri = mediaproofpicts_SelfiefsSourceUri;

      CreateMediaproofpictsDto_.SupportfsSourceUri = array_support_file;
      await this.MediaproofpictsService.updatebyId(mediaproofpicts[i]._id.toString(), CreateMediaproofpictsDto_);
    }
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
