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
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';

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

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
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
            messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di Hyppe, nama yang sudah terdaftar adalah " + namamediaprof.toUpperCase();;
        }
        else if (language === "en") {
            messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on Hyppe, the registered name is " + namamediaprof.toUpperCase();;
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
                    CreateUserbankaccountsDto.createdAt = dt.toISOString();
                    CreateUserbankaccountsDto.updatedAt = dt.toISOString();
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
    @Post('api/userbankaccounts/appeal')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'supportFile', maxCount: 3, }], multerOptions))
    async upload(
        @UploadedFiles() files1: {
            supportFile?: Express.Multer.File[]
        },

        @Body() CreateUserbankaccountsDto_: CreateUserbankaccountsDto,
        @Headers() headers) {

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
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
        var idBank = null;
        var email = null;
        var iduserbank = null;
        var fullname = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var data = null;
        var datauserbank = null;
        var dataacount = null;

        iduserbank = CreateUserbankaccountsDto_._id;

        var iduserbankacount = mongoose.Types.ObjectId(iduserbank);

        CreateUserbankaccountsDto_.active = true;
        CreateUserbankaccountsDto_.createdAt = dt.toISOString();
        CreateUserbankaccountsDto_.updatedAt = dt.toISOString();
        CreateUserbankaccountsDto_.userHandle = [{
            "reasonId": null,
            "valueReason": "",
            "idUserHandle": null,
            "createdAt": dt.toISOString(),
            "updatedAt": dt.toISOString(),
            "status": "BARU"
        }];

        var paths = iduserbank;
        var mongoose_gen_meida = paths;

        try {
            datauserbank = await this.userbankaccountsService.findemail(iduserbankacount);
        } catch (e) {
            datauserbank = null;
        }

        if (datauserbank !== undefined || datauserbank !== null) {
            email = datauserbank[0].email;
            fullname = datauserbank[0].fullName;
            //Ceck supportFile
            if (files1.supportFile != undefined) {
                var countfile = files1.supportFile.length;

                for (var i = 0; i < countfile; i++) {
                    var FormData_ = new FormData();
                    supportFile_data = files1.supportFile[i];
                    supportFile_mimetype = files1.supportFile[i].mimetype;
                    supportFile_filename = files1.supportFile[i].filename;
                    supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
                    supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

                    //New Name file supportFile
                    supportFile_filename_new = iduserbank + '_000' + (i + 1) + '.' + supportFile_etx;
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
                        FormData_.append('supportfile', fs.createReadStream(path.resolve(supportFile_local_path)));
                        await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
                    } catch (err) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed supportfile failed upload seaweedfs',
                        );
                    }

                    var objSuri = '/localrepo/' + mongoose_gen_meida + '/supportfile/' + supportFile_filename_new;
                    var objsname = supportFile_filename_new.replace('_000' + i, '');

                    arrayUri.push(supportFile_filename_new);
                    arrayName.push(supportFile_filename);
                    arraySuri.push(objSuri);
                    arraySname.push(objsname);
                }

                CreateUserbankaccountsDto_.mediaSupportType = 'supportfile';
                CreateUserbankaccountsDto_.mediaSupportBasePath = mongoose_gen_meida + '/supportfile/';
                CreateUserbankaccountsDto_.mediaSupportUri = arrayUri;
                CreateUserbankaccountsDto_.SupportOriginalName = arrayName;
                CreateUserbankaccountsDto_.SupportfsSourceUri = arraySuri;
                CreateUserbankaccountsDto_.SupportfsSourceName = arraySname;
                CreateUserbankaccountsDto_.SupportfsTargetUri = arrayUri;
                CreateUserbankaccountsDto_.SupportmediaMime = supportFile_mimetype;

                data = await this.userbankaccountsService.update(iduserbank, CreateUserbankaccountsDto_);



                fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
                    if (err) {
                        throw err;
                    }
                });

                try {
                    dataacount = await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "REQUEST_APPEAL", "BANK", fullname);
                } catch (e) {
                    await this.errorHandler.generateNotAcceptableException(
                        e.toString(),
                    );
                }
                return {
                    "response_code": 202,
                    "data": data,
                    "messages": {
                        "info": [
                            "Success Upload"
                        ]
                    }
                };

            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed supportFile is required',
                );
            }

        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed data is not found',
            );
        }


    }

    @UseGuards(JwtAuthGuard)
    @Post('api/userbankaccounts/approval')
    async reportHandleAproval(@Req() request) {
        var id = null;

        var disetujui = null;
        var reason = null;
        var reasonId = null;
        var iduserhandle = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["disetujui"] !== undefined) {
            disetujui = request_json["disetujui"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["iduserhandle"] !== undefined) {
            iduserhandle = request_json["iduserhandle"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        reason = request_json["reason"];
        reasonId = request_json["reasonId"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idreason = mongoose.Types.ObjectId(reasonId);
        var idakun = mongoose.Types.ObjectId(id);
        var iduser = mongoose.Types.ObjectId(iduserhandle);



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var userHandle = [];
        var datauserbank = null;
        var email = null;


        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        try {
            datauserbank = await this.userbankaccountsService.findemail(idakun);
        } catch (e) {
            datauserbank = null;
        }



        if (datauserbank !== undefined || datauserbank !== null) {
            email = datauserbank[0].email;

            try {
                datacontent = await this.userbankaccountsService.findOneid(idakun);
                userHandle = datacontent._doc.userHandle;

            } catch (e) {
                datacontent = null;
                userHandle = [];
            }
            if (disetujui === true) {


                if (userHandle.length > 0) {
                    await this.userbankaccountsService.updateDisetujui(idakun, "", dt.toISOString(), null, iduser);

                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "NOTSUSPENDED_APPEAL", "BANK", "");
                }
                else {

                    objreporthandle = {

                        "reasonId": null,
                        "valueReason": "",
                        "idUserHandle": iduser,
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DISETUJUI"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.userbankaccountsService.updateDisetujuiEmpty(idakun, dt.toISOString(), arrayreportedHandle);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "NOTSUSPENDED_APPEAL", "BANK", "");
                }


            }

            else {

                if (userHandle.length > 0) {
                    await this.userbankaccountsService.updateDitolak(idakun, reason, dt.toISOString(), idreason, iduser);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "SUSPENDED_APPEAL", "BANK", "");

                } else {
                    objreporthandle = {

                        "reasonId": idreason,
                        "valueReason": "",
                        "idUserHandle": iduser,
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITOLAK"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.userbankaccountsService.updateDitolakEmpty(idakun, dt.toISOString(), arrayreportedHandle);
                    await this.sendReportAppealBankFCM(email, "NOTIFY_APPEAL", "SUSPENDED_APPEAL", "BANK", "");

                }


            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed data is not found',
            );
        }
        return { response_code: 202, messages };
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




    async sendReportAppealBankFCM(email: string, name: string, event: string, type: string, fullname: string) {
        var Templates_ = new TemplatesRepo();
        var repbodyin = null;
        var repbodyen = null;
        Templates_ = await this.utilsService.getTemplateAppealBank(name, event, 'NOTIFICATION', type);

        var titlein = Templates_.subject_id.toString();
        var titleen = Templates_.subject.toString();



        var bodyin_get = Templates_.body_detail_id.toString();
        var bodyen_get = Templates_.body_detail.toString();

        if (event === "REQUEST_APPEAL" && type === "BANK") {
            repbodyin = bodyin_get.replace("${user_name}", fullname);
            repbodyen = bodyen_get.replace("${user_name}", fullname);
        } else {
            repbodyin = bodyin_get;
            repbodyen = bodyen_get;
        }

        var eventType = type.toString();
        await this.utilsService.sendFcm(email, titlein, titleen, repbodyin, repbodyen, eventType, event, undefined, undefined);
    }
}
