import { Body, Controller, Post, UploadedFiles, Headers, UseInterceptors, Req, NotAcceptableException } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import * as fs from 'fs';
import { request } from "http";
import { FormDataRequest } from "nestjs-form-data";
import { MediaService } from "./media.service";
import { ErrorHandler } from "../../utils/error.handler";
const multer = require('multer');

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
export class MediaController {
    constructor(
        private readonly mediaService: MediaService,
        private readonly errorHandler: ErrorHandler) {}

    @Post('api/posts/profilepicture')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'profilePict', maxCount: 1 }, { name: 'proofPict', maxCount: 1, }], { storage: storage }))
    async uploadcomparing(
        @UploadedFiles() files: { 
            profilePict?: Express.Multer.File[], 
            proofPict?: Express.Multer.File[] 
        }, 
        @Body() request,
        @Headers() headers) {
        if (headers['x-auth-user'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
            throw new NotAcceptableException({
                response_code: 406,
                messages: {
                    info: ['Unabled to proceed'],
                },
            });
        }
        // if (!(await this.utilsService.validasiTokenEmail(headers))) {
        //     throw new NotAcceptableException({
        //         response_code: 406,
        //         messages: {
        //             info: ['Unabled to proceed Unauthorized email header dan token not match'],
        //         },
        //     });
        // }
        //const bitmap1 = fs.readFileSync('./upload/' + files.profilePict[0].filename, 'base64');
        //const bitmap2 = fs.readFileSync('./upload/' + files.proofPict[0].filename, 'base64');
        console.log(request.email);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update Profile interest successful"
                ]
            }
        };
    }
}