import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import * as http from 'http';
import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
const multer = require('multer');

var weedClient = require("node-seaweedfs");

var server = process.env.SEAWEEDFS_HOST;
var port = process.env.SEAWEEDFS_PORT;
var BaseUrl = 'http://' + server + ':' + port;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './upload');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});



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


  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    {
      name: 'file',
      maxCount: 1,

    },
    { name: 'file2', maxCount: 1 }

  ], { storage: storage }),

  )

  uploadFile(@UploadedFiles() files: { file?: Express.Multer.File[], file2?: Express.Multer.File[] }) {

  }

  async fileUpload(fileName: string) {
    var weedClient = require("node-seaweedfs");

    var seaweedfs = new weedClient({
      server: "172.16.0.4",
      port: 9555

    });

    seaweedfs.write("./upload/" + fileName).then(function (fileInfo) {
      console.log(fileInfo.fileUrl);
      return seaweedfs.read(fileInfo.fid);
    }).then(function (Buffer) {
      throw new BadRequestException(Buffer);
    }).catch(function (err) {
      throw new BadRequestException(err);
    });
  }
}

