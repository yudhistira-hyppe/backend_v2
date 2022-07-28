import { Controller, Get, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { FileInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import { AwsService } from './aws.service';
import * as http from 'http';
import * as fs from 'fs';
import { Config, Rekognition } from "aws-sdk";
import { AwsCompareFacesRequest, AwsDetectFacesRequest } from "./dto/aws.dto";
const multer = require('multer');

var config = new Config({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

var server = process.env.SEAWEEDFS_HOST;
var port = process.env.SEAWEEDFS_PORT;
var BaseUrl = 'http://' + server + ':' + port;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './testing');
    },
    filename: (req, file, cb) => {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

@Controller()
export class AwsController {
    constructor(private readonly awsService: AwsService) { }

    // @Get('api/aws/test')
    // async test(AwsRequest_: AwsRequest) {
    //     return await this.awsService.test();
    //     // console.log(data);
    // }

    // @Post('api/aws/comparing')
    // async comparing(AwsRequest_: AwsRequest) {
    //     // const data = await this.awsService.comparing(AwsRequest_);
    //     // console.log(data);
    // }

    @Get('api/aws/seaweedfs')
    async findseaweedfs() {
        console.log(BaseUrl + '/dir/lookup?volumeId=61a4986e7102913900c9e57d');
        console.log(BaseUrl + '/localrepo/lookup?volumeId=61a4986e7102913900c9e57d');
        return new Promise(function (resolve, reject) {
            var req = http.request(BaseUrl + '/localrepo/62bc0ee11140b677c847cf1c/profilepict/5565285e-bfa4-485b-8c44-833084ff8c45_0001.jpeg', res => {
                let body = [];

                res.on('data', function (chunk) {
                    body.push(chunk)
                    console.log();
                });
                res.on('end', function () {
                    console.log(body);
                    return resolve(Buffer.concat(body));
                });
                //res.pipe(file);
            });
            req.on("error", function (err) {
                return reject(err);
            });
            req.end();
        });
        // seaweedfs.find('a0187737-5d5c-4dc1-b350-4e73ecf2dd6b').then(function (json) {
        //     console.log(json.locations);
        // });
    }

    @Post('api/aws/comparing/upload') 
    @UseInterceptors(FileFieldsInterceptor([{ name: 'avatar', maxCount: 1 },{ name: 'background', maxCount: 1, }], { storage: storage }))
    async uploadcomparing(@UploadedFiles() files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }) {
        let bitmap1 = null;
        let bitmap2 = null;
        if (files.avatar != undefined) {
            bitmap1 = fs.readFileSync('./testing/' + files.avatar[0].filename, 'base64');

        }
        if (files.background != undefined) {
            bitmap1 = fs.readFileSync('./testing/' + files.avatar[0].filename, 'base64');
            bitmap2 = fs.readFileSync('./testing/' + files.background[0].filename, 'base64');
        }

        const buffer1 = Buffer.from(bitmap1, 'base64');
        //const buffer2 = Buffer.from(bitmap2, 'base64');

        var AwsCompareFacesRequest_ = new AwsCompareFacesRequest();
        var AwsDetectFacesRequest_1 = new AwsDetectFacesRequest();
        var AwsDetectFacesRequest_2 = new AwsDetectFacesRequest();

        // AwsDetectFacesRequest_1.Image.Bytes = buffer1;
        AwsDetectFacesRequest_1.Attributes = ["DEFAULT"];

        //AwsDetectFacesRequest_2.Image.Bytes = buffer2;
        AwsDetectFacesRequest_2.Attributes = ["DEFAULT"];

        // AwsCompareFacesRequest_.SourceImage.Bytes = buffer1;
        // AwsCompareFacesRequest_.SourceImage.Bytes = buffer1;
        AwsCompareFacesRequest_.SimilarityThreshold = 70;
        AwsCompareFacesRequest_.QualityFilter = "HIGHT";

        const image_1 = await this.awsService.detect(AwsDetectFacesRequest_1);
        //const image_2 = await this.awsService.detect(AwsDetectFacesRequest_2);

        //const data = await this.awsService.comparing(AwsCompareFacesRequest_);
        //console.log(data);
        return image_1;
    }
}