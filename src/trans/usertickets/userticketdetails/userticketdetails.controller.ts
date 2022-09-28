import { Body, Controller, Req, Delete, Get, Param, Post, UseGuards, Put, Request, HttpCode, BadRequestException, HttpException, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { UserticketdetailsService } from './userticketdetails.service';
import { CreateUserticketdetailsDto } from './dto/create-userticketdetails.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UserbasicsService } from '../../userbasics/userbasics.service';
import { Res, HttpStatus, Response, Headers } from '@nestjs/common';
import { UserticketsService } from '../usertickets.service';
import { ErrorHandler } from "../../../utils/error.handler";
import { isEmpty } from 'rxjs';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UtilsService } from "../../../utils/utils.service";
import { SeaweedfsService } from "../../../stream/seaweedfs/seaweedfs.service";
import { LogticketsService } from '../../logtickets/logtickets.service';
import { extname } from 'path';
import { diskStorage } from 'multer';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { CreateLogticketsDto } from '../../../trans/logtickets/dto/create-logtickets.dto';
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
export class UserticketdetailsController {

    constructor(private readonly userticketdetailsService: UserticketdetailsService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly seaweedfsService: SeaweedfsService,
        private readonly userticketsService: UserticketsService,
        private readonly logticketsService: LogticketsService) { }

    // @UseGuards(JwtAuthGuard)
    // @Post('api/usertickets/reply')
    // async create(@Res() res, @Body() CreateUserticketdetailsDto: CreateUserticketdetailsDto, @Request() req) {
    //     const messages = {
    //         "info": ["The create successful"],
    //     };

    //     const messagesEror = {
    //         "info": ["Todo is not found!"],
    //     };


    //     var request_json = JSON.parse(JSON.stringify(req.body));
    //     var IdUserticket = null;
    //     var status = null;

    //     var reqdata = req.user;
    //     var email = reqdata.email;

    //     var ubasic = await this.userbasicsService.findOne(email);

    //     var iduser = ubasic._id;
    //     var dt = new Date(Date.now());
    //     dt.setHours(dt.getHours() + 7); // timestamp
    //     dt = new Date(dt);

    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     user: mongoose.Types.ObjectId(request_json["IdUserticket"])
    //     if (request_json["IdUserticket"] === undefined) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "ID tiket tidak boleh kosong"
    //         });

    //     }
    //     else if (request_json["status"] === undefined) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "status tidak boleh kosong"
    //         });

    //     }

    //     else {
    //         status = request_json["status"];
    //         IdUserticket = request_json["IdUserticket"];
    //         var idusertiket = mongoose.Types.ObjectId(request_json["IdUserticket"]);
    //         CreateUserticketdetailsDto.IdUser = iduser;
    //         CreateUserticketdetailsDto.datetime = dt.toISOString();
    //         CreateUserticketdetailsDto.IdUserticket = idusertiket;
    //         try {
    //             let data = await this.userticketdetailsService.create(CreateUserticketdetailsDto);
    //             await this.userticketsService.update(idusertiket, status);
    //             res.status(HttpStatus.OK).json({
    //                 response_code: 202,
    //                 "data": data,
    //                 "message": messages
    //             });
    //         } catch (e) {
    //             res.status(HttpStatus.BAD_REQUEST).json({

    //                 "message": messagesEror
    //             });
    //         }

    //     }

    // }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/usertickets/reply')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3 }], multerOptions))
    async upload(
        @UploadedFiles() files: {
            supportFile?: Express.Multer.File[],

        },
        // @UploadedFiles() files2: Array<Express.Multer.File>,
        @Body() CreateUserticketdetailsDto: CreateUserticketdetailsDto,
        @Headers() headers, @Res() res, @Request() req) {
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

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
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
        var status = null;
        var type = null;
        var IdUserticket = null;
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var request_json = JSON.parse(JSON.stringify(req.body));

        if (request_json["IdUserticket"] !== undefined) {
            IdUserticket = request_json["IdUserticket"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        if (await this.utilsService.ceckData(datauserbasicsService)) {
            // var mongoose_gen_meida = new mongoose.Types.ObjectId();

            //Update proofPict
            try {


                var email = headers['x-auth-user'];

                var ubasic = await this.userbasicsService.findOne(email);

                var iduser = ubasic._id;
                var dt = new Date(Date.now());
                dt.setHours(dt.getHours() + 7); // timestamp
                dt = new Date(dt);


                IdUserticket = request_json["IdUserticket"];
                var body = CreateUserticketdetailsDto.body;
                var idusertiket = mongoose.Types.ObjectId(request_json["IdUserticket"]);
                CreateUserticketdetailsDto.IdUser = iduser;
                CreateUserticketdetailsDto.datetime = dt.toISOString();
                CreateUserticketdetailsDto.IdUserticket = idusertiket;
                datausertiket = await this.userticketdetailsService.create(CreateUserticketdetailsDto);


                var IdMediaproofpictsDto = datausertiket._id.toString();
                var objadsid = datausertiket._id;
                var paths = IdMediaproofpictsDto;
                var mongoose_gen_meida = paths;


                if (type === "comment") {

                    let datalogticket = new CreateLogticketsDto();
                    datalogticket.userId = iduser;
                    datalogticket.createdAt = dt.toISOString();
                    datalogticket.ticketId = idusertiket;
                    datalogticket.type = "comment";
                    datalogticket.remark = "comment on " + body;
                    await this.logticketsService.create(datalogticket);
                } else {
                    await this.userticketsService.update(idusertiket, status);
                    let datalogticket = new CreateLogticketsDto();
                    datalogticket.userId = iduser;
                    datalogticket.createdAt = dt.toISOString();
                    datalogticket.ticketId = idusertiket;
                    datalogticket.type = "change status";
                    datalogticket.remark = "change status to " + status;
                    await this.logticketsService.create(datalogticket);

                }
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

                    CreateUserticketdetailsDto.mediaType = 'supportfile';
                    CreateUserticketdetailsDto.mediaBasePath = mongoose_gen_meida + '/supportfile/';
                    CreateUserticketdetailsDto.mediaUri = arrayUri;
                    CreateUserticketdetailsDto.originalName = arrayName;
                    CreateUserticketdetailsDto.fsSourceUri = arraySuri;
                    CreateUserticketdetailsDto.fsSourceName = arraySname;
                    CreateUserticketdetailsDto.fsTargetUri = arraySuri;
                    CreateUserticketdetailsDto.mediaMime = supportFile_mimetype;
                    await this.userticketdetailsService.updatedata(objadsid, CreateUserticketdetailsDto);

                    var data = await this.userticketdetailsService.findOne(objadsid);

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

    @Post('api/usertickets/comment')
    @UseGuards(JwtAuthGuard)
    async retrieveComment(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var id = null;
        var type = null;
        var objdata = {};
        var arrdata = [];
        var data = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var idticket = mongoose.Types.ObjectId(request_json["id"]);
        const messages = {
            "info": ["The process successful"],
        };


        let dataticket = await this.userticketsService.detail(idticket);
        var datadetail = await this.userticketdetailsService.findOneType(idticket, type);
        var lenghdetail = datadetail.length;
        for (var i = 0; i < lenghdetail; i++) {

            objdata = {
                "_id": datadetail[i]._id,
                "type": datadetail[i].type,
                "body": datadetail[i].body,
                "datetime": datadetail[i].datetime,
                "IdUser": datadetail[i].IdUser,
                "status": datadetail[i].status,
                "mediaUri": datadetail[i].mediaUri,
                "originalName": datadetail[i].originalName,
                "fsSourceUri": datadetail[i].fsSourceUri,
                "fsSourceName": datadetail[i].fsSourceName,
                "fsTargetUri": datadetail[i].fsTargetUri,
                "mediaBasePath": datadetail[i].mediaBasePath,
                "mediaMime": datadetail[i].mediaMime,
                "mediaType": datadetail[i].mediaType,
            }

            arrdata.push(objdata);
        }

        data = [{
            "_id": dataticket[0]._id,
            "nomortiket": dataticket[0].nomortiket,
            "pengirim": dataticket[0].pengirim,
            "penerima": dataticket[0].penerima,
            "subject": dataticket[0].subject,
            "body": dataticket[0].body,
            "status": dataticket[0].status,
            "isRead": dataticket[0].isRead,
            "active": dataticket[0].active,
            "datetime": dataticket[0].datetime,
            "nameCategory": dataticket[0].nameCategory,
            "nameLevel": dataticket[0].nameLevel,
            "sourceName": dataticket[0].sourceName,
            "sourceTicket": dataticket[0].sourceTicket,
            "mediaBasePath": dataticket[0].mediaBasePath,
            "mediaMime": dataticket[0].mediaMime,
            "mediaType": dataticket[0].mediaType,
            "mediaUri": dataticket[0].mediaUri,
            "originalName": dataticket[0].originalName,
            "fsSourceUri": dataticket[0].fsSourceUri,
            "fsSourceName": dataticket[0].fsSourceName,
            "fsTargetUri": dataticket[0].fsTargetUri,
            "avatar": dataticket[0].avatar,
            "detail": arrdata
        }]

        return { response_code: 202, data, messages };
    }

}
