import { Controller, Get, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import { AwsService } from './aws.service';
import { AwsRequest, ImageDataRequest } from "./dto/aws.dto";
import * as http from 'http';
import * as fs from 'fs';
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
@Controller()
export class AwsController {
    constructor(private readonly awsService: AwsService) { }

    // @Post('api/aws/comparing')
    // async comparing(AwsRequest_: AwsRequest) {
    //     const data = await this.awsService.comparing(AwsRequest_);
    //     console.log(data);
    // }

    // @Get('api/aws/seaweedfs')
    // async findseaweedfs() {
    //     console.log(BaseUrl + '/dir/lookup?volumeId=61a4986e7102913900c9e57d');
    //     console.log(BaseUrl + '/localrepo/lookup?volumeId=61a4986e7102913900c9e57d');
    //     return new Promise(function (resolve, reject) {
    //         var req = http.request(BaseUrl + '/localrepo/62bc0ee11140b677c847cf1c/profilepict/5565285e-bfa4-485b-8c44-833084ff8c45_0001.jpeg', res => {
    //             let body = [];

    //             res.on('data', function (chunk) {
    //                 body.push(chunk)
    //                 console.log();
    //             });
    //             res.on('end', function () {
    //                 console.log(body);
    //                 return resolve(Buffer.concat(body));
    //             });
    //             //res.pipe(file);
    //         });
    //         req.on("error", function (err) {
    //             return reject(err);
    //         });
    //         req.end();
    //     });
    //     // seaweedfs.find('a0187737-5d5c-4dc1-b350-4e73ecf2dd6b').then(function (json) {
    //     //     console.log(json.locations);
    //     // });
    // }

    // @Post('api/aws/comparing/upload') 
    // @UseInterceptors(FileFieldsInterceptor(
    //     [
    //         { name: 'avatar', maxCount: 1 },
    //         { name: 'background', maxCount: 1, }
    //     ], { storage: storage }))
    // async uploadcomparing(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
    //     const bitmap1 = fs.readFileSync('./upload/' + files.avatar[0].filename, 'base64');
    //     const bitmap2 = fs.readFileSync('./upload/' + files.background[0].filename, 'base64');
    //     // const buffer1 = Buffer.from(bitmap1, 'base64');
    //     // const buffer2 = Buffer.from(bitmap2, 'base64');

    //     // const deserialized1 = Buffer.from(bitmap1, "binary")
    //     // const deserialized2 = Buffer.from(bitmap2, "binary")
    //     //console.log(bitmap1);
    //     // console.log(bitmap1.length);
    //     // console.log(bitmap2.length);
    //     var AwsRequest_ = new AwsRequest(); 
    //     var Image_1 = new ImageDataRequest();
    //     var Image_2 = new ImageDataRequest();

    //     // Image_1.Bytes = bitmap1;
    //     // Image_2.Bytes = bitmap2;

    //     AwsRequest_.SimilarityThreshold = 70;
    //     // AwsRequest_.SourceImage = { Bytes: bitmap1 };
    //     // AwsRequest_.TargetImage = { Bytes: bitmap2 };
    //     const data = await this.awsService.comparing({
    //         "SourceImage": {
    //             "Bytes": bitmap1
    //         },
    //         "TargetImage": {
    //             "Bytes": bitmap2
    //         },
    //         "SimilarityThreshold": 70
    //     });
    //     return {
    //         "SourceImage": {
    //             "Bytes": bitmap1
    //         },
    //         "TargetImage": {
    //             "Bytes": bitmap2
    //         },
    //         "SimilarityThreshold": 70
    //     };
    // }
}