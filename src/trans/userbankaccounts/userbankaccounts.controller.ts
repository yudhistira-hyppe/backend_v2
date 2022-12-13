import { Body, Controller, Post, UploadedFiles, Logger, Headers, UseInterceptors, Req, BadRequestException, NotAcceptableException, Res, HttpException, HttpStatus, HttpCode, Request, Query, UseGuards, Put, Param } from "@nestjs/common";
import { AnyFilesInterceptor, FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { UserbankaccountsService } from './userbankaccounts.service';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Userbankaccounts } from './schemas/userbankaccounts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { BanksService } from '../banks/banks.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { isLowercase } from 'class-validator';
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../../stream/seaweedfs/seaweedfs.service";
import { extname } from 'path';
import { diskStorage } from 'multer';
import { UtilsService } from "../../utils/utils.service";
//import FormData from "form-data";
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");

export const multerConfig = {
    //dest: process.env.PATH_UPLOAD,
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
export class UserbankaccountsController {
    constructor(private readonly userbankaccountsService: UserbankaccountsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly banksService: BanksService,
        private readonly mediaproofpictsService: MediaproofpictsService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly seaweedfsService: SeaweedfsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/userbankaccounts')
    async create(@Res() res, @Body() CreateUserbankaccountsDto: CreateUserbankaccountsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var email = null;
        var noRek = null;
        var bankcode = null;
        var nama = null;
        var idbank = null;
        var datamediaprof = null;
        var datarekkembar = null;
        var namamediaprof = null;
        var language = null;
        var messageRespon = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["language"] !== undefined) {
            language = request_json["language"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        if (request_json["noRek"] !== undefined) {
            noRek = request_json["noRek"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["nama"] !== undefined) {
            nama = request_json["nama"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var proofPict_json = JSON.parse(JSON.stringify(ubasic.proofPict));
        var id_mediaproofpicts = proofPict_json.$id;
        try {
            datamediaprof = await this.mediaproofpictsService.findOne(id_mediaproofpicts);
            namamediaprof = datamediaprof.nama.toLowerCase();
        } catch (e) {
            datamediaprof = null;
            namamediaprof = "";
        }

        if (language === "id") {
            messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di hyppe, nama yang sudah terdaftar adalah " + namamediaprof.toUpperCase();;
        }
        else if (language === "en") {
            messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on hyppe, the registered name is " + namamediaprof.toUpperCase();;
        }



        var lownama = nama.toLowerCase();
        var idakun = null;
        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarekkembar = await this.userbankaccountsService.findnorek(noRek, idbank.toString());
            idakun = datarekkembar._id;
        } catch (e) {
            datarekkembar = null;
        }
        if (datarekkembar === null) {

            if (lownama === namamediaprof) {
                try {
                    CreateUserbankaccountsDto.userId = iduser;
                    CreateUserbankaccountsDto.noRek = noRek;
                    CreateUserbankaccountsDto.idBank = idbank;
                    // CreateUserbankaccountsDto.statusInquiry = false;
                    CreateUserbankaccountsDto.active = true;

                    let data = await this.userbankaccountsService.create(CreateUserbankaccountsDto);
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                } catch (e) {
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messagesEror
                    });
                }
            } else {
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messageRespon
                });
            }

        } else {


            await this.userbankaccountsService.updateactivetrue(idakun);
            let data = await this.userbankaccountsService.findOneid(idakun);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
            // throw new BadRequestException("account number already exists..!");
        }

    }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/userbankaccounts/create')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3, }], multerOptions))
    async upload(
        @UploadedFiles() files1: {
            supportFile?: Express.Multer.File[]
        },
        // @UploadedFiles() files2: Array<Express.Multer.File>,
        @Body() CreateUserbankaccountsDto_: CreateUserbankaccountsDto,
        @Headers() headers) {
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

        console.log(files1);
        //   console.log(files2);

        var countfile = files1.supportFile.length;
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

        var emailuserbasic = null;
        //Var current date
        var current_date = await this.utilsService.getDateTimeString();

        //Var generate id
        var IdMediaproofpictsDto = await this.utilsService.generateId();
        //Var generate id mongoose


        //Ceck User Userbasics
        const datauserbasicsService = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );

        var titleinsukses = null;
        var titleensukses = null;
        var bodyinsukses = null;
        var bodyensukses = null;
        var eventType = null;
        var event = null;
        if (await this.utilsService.ceckData(datauserbasicsService)) {
            // // var mongoose_gen_meida = new mongoose.Types.ObjectId();
            // titleinsukses = "Dalam Proses Verifikasi";
            // titleensukses = "Verification On Progress";
            // bodyinsukses = "Hai " + datauserbasicsService.fullName + "! Kami sedang meninjau data yang Anda kirimkan. ini akan memakan waktu 3x24 jam proses";
            // bodyensukses = "Hi " + datauserbasicsService.fullName + "! We are currently reviewing the data you submitted. this will take a 3x24 hour process";
            // eventType = "SUPPORTFILE";
            // event = "REQUEST";

            emailuserbasic = datauserbasicsService.email;


            var paths = IdMediaproofpictsDto;
            var mongoose_gen_meida = paths;

            // /Ceck Data user proofPict
            // Ceck Data user proofPict

            //Update proofPict
            try {



                await this.userbankaccountsService.create(CreateUserbankaccountsDto_);


                // await this.utilsService.sendFcm(emailuserbasic, titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
            } catch (err) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed update Mediaproofpicts ' + err,
                );
            }


            //Ceck supportFile
            if (files1.supportFile != undefined) {


                for (var i = 0; i < countfile; i++) {
                    var FormData_ = new FormData();
                    supportFile_data = files1.supportFile[i];
                    supportFile_mimetype = files1.supportFile[i].mimetype;
                    supportFile_filename = files1.supportFile[i].filename;
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

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }






            //Delete directory recursively

            fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });

            return {
                "response_code": 202,
                "data": {
                    "id_mediaproofpicts": IdMediaproofpictsDto,
                    "status": "IN_PROGGRESS"
                },
                "messages": {
                    "info": [
                        "Success Upload"
                    ]
                }
            };
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('api/userbankaccounts/:id')
    async update(@Res() res, @Param('id') id: string, @Body() createUserbankaccountsDto: CreateUserbankaccountsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.userbankaccountsService.update(id, createUserbankaccountsDto);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }


    @Post('api/userbankaccounts/byuser')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var datauserbasicsService = null;
        var iduser = null;
        //Ceck User Userbasics
        try {
            datauserbasicsService = await this.userbasicsService.findOne(email);
        } catch (e) {
            throw new BadRequestException("User not found");
        }
        const messages = {
            "info": ["The process successful"],
        };

        iduser = mongoose.Types.ObjectId(datauserbasicsService._id);
        let data = await this.userbankaccountsService.findOneUser(iduser);

        return { response_code: 202, data, messages };
    }

    @Post('api/userbankaccounts/delete')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var id = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The delete successful"],
        };

        var _id = mongoose.Types.ObjectId(id);
        let data = await this.userbankaccountsService.updateactive(_id);

        return { response_code: 202, messages };
    }



}
