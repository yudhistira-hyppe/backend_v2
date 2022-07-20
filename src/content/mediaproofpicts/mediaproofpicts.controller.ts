import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';




@Controller('api/mediaproofpicts')
export class MediaproofpictsController {
  constructor(private readonly MediaproofpictsService: MediaproofpictsService) { }

  // @Post()
  // async create(@Body() CreateMediaproofpictsDto: CreateMediaproofpictsDto) {
  //   await this.MediaproofpictsService.create(CreateMediaproofpictsDto);
  // }

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

  // @Post()
  // @UseGuards(JwtAuthGuard)
  // @FormDataRequest()
  // async upload(@Res() res, @Headers('x-auth-token') auth: string, @Request() request) {
  //   var request_json = JSON.parse(JSON.stringify(request.body));
  //   var files = null;
  //   if (request_json["files"] !== undefined) {
  //     files = request_json["files"];
  //   } else {
  //     throw new BadRequestException("Unabled to proceed");
  //   }
  //   var filename = files.originalName;
  //   var weedClient = require("node-seaweedfs");

  //   var seaweedfs = new weedClient({
  //     server: "172.16.0.4",
  //     port: 9555,

  //   });
  //   seaweedfs.write("./" + filename, { replication: '000' }).then(function (fileInfo) {
  //     console.log(fileInfo);
  //   }).catch(function (err) {
  //     throw new BadRequestException(err);
  //   });
  //   // seaweedfs.write("./" + filename).then(function (fileInfo) {
  //   //   return seaweedfs.read(fileInfo.fid);
  //   // }).then(function (Buffer) {
  //   //   throw new BadRequestException(Buffer);
  //   // }).catch(function (err) {
  //   //   throw new BadRequestException(err);
  //   // });
  // }


  //   @Post()
  //   @UseInterceptors(FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: './upload'
  //     }),

  //   }))
  //   uploadFile(@UploadedFile() file) {

  //     var filename = file.originalname;
  //    // var weedClient = require("node-seaweedfs");

  //     // var seaweedfs = new weedClient({
  //     //   server: "172.16.0.4",
  //     //   port: 9555,

  //     // });
  //     // seaweedfs.write("./upload/" + filename, { replication: '000' }).then(function (fileInfo) {
  //     //   console.log(fileInfo);
  //     // }).catch(function (err) {
  //     //   throw new BadRequestException(err);
  //     // });

  //     // seaweedfs.write("./upload/" + filename).then(function (fileInfo) {
  //     //   return seaweedfs.read(fileInfo.fid);
  //     // }).then(function (Buffer) {
  //     //   throw new BadRequestException(Buffer);
  //     // }).catch(function (err) {
  //     //   throw new BadRequestException(err);
  //     // });
  //     var fs = require("fs");
  // var weedfs = require("../../index.js");
  // var expect = require('chai').expect;

  // var config={ server: "172.16.0.4",
  // port: 9555};
  // var client = new weedfs(config);



  //        client.write("./test/tests/test.jpg").then(function(fileInfo) {
  //         expect(fileInfo).to.be.an("object");

  //         return client.remove(fileInfo.fid);
  //     }).then(function(res) {
  //         expect(res).to.be.an("object");
  //         expect(res.count).to.be.greaterThan(0);
  //         done();
  //     }).catch(function(err) {
  //         console.log(err);
  //     });
  //   }
}
