import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { SeaweedfsService } from './seaweedfs.service';
import { FileInterceptor, FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import * as http from 'http';
var FormData = require('form-data');
var url = require("url");
import * as fs from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
const multer = require('multer');
var server = process.env.SEAWEEDFS_HOST;
var port = process.env.SEAWEEDFS_PORT;
var BaseUrl = 'http://' + server + ':' + port;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');
    },
    filename: (req, file, cb) => {
        var name = file.originalname;
        var splitname = name.split('.');
        const fileName = uuidv4() + '.' + splitname[1];
        cb(null, fileName)
    }
});
@Controller()
export class SeaweedfsController {
    constructor(private readonly seaweedfsService: SeaweedfsService) {
    }

    @Post('api/seaweedfs')
    @UseInterceptors(FileFieldsInterceptor([
        {
            name: 'ktp',
            maxCount: 1,

        },
        { name: 'selfie', maxCount: 1 },
        { name: 'support', maxCount: 1 }

    ], { storage: storage }),

    )

    uploadFile(@UploadedFiles() files: { ktp?: Express.Multer.File[], selfie?: Express.Multer.File[] }) {



        // this.seaweedfsService.write("./upload/" + files.ktp[0].filename).then(function (fileInfo) {

        //     return this.seaweedfsService.read(fileInfo.fid);
        // }).then(function (Buffer) {
        //     throw new BadRequestException(Buffer);
        // }).catch(function (err) {
        //     throw new BadRequestException(err);
        // });
        const file = fs.readFileSync('./upload/' + files.ktp[0].filename);
        //this.seaweedfsService.write(file);

    }
}