import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, UploadedFiles, UseInterceptors, HttpCode, HttpException, Req, BadRequestException } from '@nestjs/common';
import { AdsService } from './ads.service';
import { CreateAdsDto, CreateAdsResponse, MediaimageadsDto, MediavodeosadsDto } from './dto/create-ads.dto';
import { Ads } from './schemas/ads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UservouchersService } from '../uservouchers/uservouchers.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
//import { CitiesService } from '../../infra/cities/cities.service';
import { AdstypesService } from '../adstypes/adstypes.service';
import { MediaimageadsService } from '../../stream/mediaimageads/mediaimageads.service';
import { MediavideosadsService } from '../../stream/mediavideosads/mediavideosads.service';
import { FileFieldsInterceptor } from "@nestjs/platform-express/multer";
import { ErrorHandler } from "../../utils/error.handler";
import { SeaweedfsService } from "../../stream/seaweedfs/seaweedfs.service";
import { UtilsService } from "../../utils/utils.service";
import { SettingsService } from '../settings/settings.service';
import { VouchersService } from '../vouchers/vouchers.service';
//import { UserAdsService } from '../userads/userads.service';
import * as fse from 'fs-extra';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
const multer = require('multer');
var FormData = require('form-data');
var path = require("path");
import { v4 as uuidv4 } from 'uuid';
import { FormDataRequest } from 'nestjs-form-data';
import { json } from 'stream/consumers';
import { CreateUservouchersDto } from '../uservouchers/dto/create-uservouchers.dto';
import console from 'console';
import { createWriteStream } from 'fs';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

export const multerConfig = {
    dest: process.env.PATH_UPLOAD,
};

export const multerOptions = {
    // limits: {
    //     fileSize: +process.env.MAX_FILE_SIZE,
    // },
    fileFilter: (req: any, file: any, cb: any) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4)$/)) {
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
@Controller('api/ads')
export class AdsController {

    constructor(private readonly adsService: AdsService,
        private readonly uservouchersService: UservouchersService,
        private readonly userbasicsService: UserbasicsService,
        private readonly configService: ConfigService,
        private readonly mediaimageadsService: MediaimageadsService,
        private readonly mediavideosadsService: MediavideosadsService,
        private readonly adstypesService: AdstypesService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly seaweedfsService: SeaweedfsService,
        private readonly settingsService: SettingsService,
        private readonly vouchersService: VouchersService) { }


    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Ads[]> {
        return this.adsService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Ads> {
        return this.adsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adsService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdsDto: CreateAdsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adsService.update(id, createAdsDto);
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


    // @UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.ACCEPTED)
    // @Post('createads')
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'mediaAdsFile', maxCount: 1 }, { name: 'mediaVidFile', maxCount: 1 }], multerOptions))
    // async uploadsuportfile(
    //     @UploadedFiles() files: {
    //         mediaAdsFile?: Express.Multer.File[], mediaVidFile?: Express.Multer.File[]
    //     },
    //     @Body() CreateAdsDto: CreateAdsDto,
    //     @Headers() headers, @Res() res) {

    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }

    //     if (headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email is required',
    //         );
    //     }
    //     const messages = {
    //         "info": ["The create successful"],
    //     };

    //     const messagesEror = {
    //         "info": ["Todo is not found!"],
    //     };
    //     if (CreateAdsDto.liveTypeAds === undefined) {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     var startAge = CreateAdsDto.startAge;
    //     var endAge = CreateAdsDto.endAge;
    //     var typeadsId = CreateAdsDto.typeAdsID;
    //     var tayang = Number(CreateAdsDto.tayang);
    //     var datatypesAds = null;
    //     var creditValue = 0;
    //     var datavoucher = null;
    //     var uservoucherdata = null;
    //     var arrayCreditvalue = [];
    //     var arrayFreeCredit = [];
    //     var arrayTotalCredit = [];
    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     var typemedia = "";
    //     var totalCreditTayang = 0;
    //     try {
    //         datatypesAds = await this.adstypesService.findOne(mongoose.Types.ObjectId(typeadsId));

    //         creditValue = datatypesAds._doc.creditValue;
    //         typemedia = datatypesAds._doc.mediaType;
    //     } catch (e) {
    //         datatypesAds = null;
    //         creditValue = 0;
    //         typemedia = "";
    //     }

    //     var mongoose_gen_meida = uuidv4();

    //     const ubasic = await this.userbasicsService.findOne(
    //         headers['x-auth-user'],
    //     );
    //     var idmedia = null;
    //     if (await this.utilsService.ceckData(ubasic)) {
    //         if (typemedia === "image") {
    //             //Var cardPict
    //             let cardVid_data = null;
    //             let cardVid_filename = '';
    //             let cardVid_etx = '';
    //             let cardVid_mimetype = '';
    //             let cardVid_name = '';
    //             let cardVid_filename_new = '';
    //             let cardVid_local_path = '';
    //             let cardVid_seaweedfs_path = '';
    //             //Var supportFile
    //             let supportFile_data = null;
    //             let supportFile_filename = '';
    //             let supportFile_etx = '';
    //             let supportFile_mimetype = '';
    //             let supportFile_name = '';
    //             let supportFile_filename_new = '';
    //             let supportFile_local_path = '';
    //             let supportFile_seaweedfs_path = '';
    //             if (files.mediaAdsFile != undefined) {

    //                 var FormData_ = new FormData();
    //                 supportFile_data = files.mediaAdsFile[0];
    //                 supportFile_mimetype = files.mediaAdsFile[0].mimetype;
    //                 supportFile_filename = files.mediaAdsFile[0].filename;
    //                 supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
    //                 supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 supportFile_filename_new = mongoose_gen_meida + '_0001.' + supportFile_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

    //                 //Local path
    //                 supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
    //                 //SeaweedFs path
    //                 supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/mediaadsfile/';

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }

    //                 //Upload Seaweedfs
    //                 try {
    //                     FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
    //                     await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
    //                 } catch (err) {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed proofpict failed upload seaweedfs',
    //                     );
    //                 }
    //             } else {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed mediaAdsFile is required',
    //                 );
    //             }

    //             if (files.mediaVidFile != undefined) {
    //                 var FormData_ = new FormData();
    //                 cardVid_data = files.mediaVidFile[0];
    //                 cardVid_mimetype = files.mediaVidFile[0].mimetype;
    //                 cardVid_filename = files.mediaVidFile[0].filename;
    //                 cardVid_etx = cardVid_filename.substring(cardVid_filename.lastIndexOf('.') + 1, cardVid_filename.length);
    //                 cardVid_name = cardVid_filename.substring(0, cardVid_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 cardVid_filename_new = mongoose_gen_meida + '.' + cardVid_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + cardVid_filename, './temp/' + cardVid_filename_new);

    //                 //Local path
    //                 cardVid_local_path = './temp/' + mongoose_gen_meida + '/' + cardVid_filename_new;

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + cardVid_filename_new, './temp/' + mongoose_gen_meida + '/' + cardVid_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }


    //             }
    //             var name = supportFile_mimetype;
    //             var splitname = name.split('/');
    //             var type = splitname[0];

    //             var dt = new Date(Date.now());
    //             dt.setHours(dt.getHours() + 7); // timestamp
    //             dt = new Date(dt);
    //             let dtmedia = new MediaimageadsDto();
    //             dtmedia.active = true;
    //             dtmedia.createdAt = dt.toISOString();
    //             dtmedia.updatedAt = dt.toISOString();
    //             dtmedia.mediaBasePath = mongoose_gen_meida + '/mediaadsfile/';
    //             dtmedia.mediaUri = supportFile_filename_new;
    //             dtmedia.originalName = supportFile_filename;
    //             dtmedia.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/mediaadsfile/' + supportFile_filename_new;
    //             dtmedia.fsSourceName = supportFile_filename_new.replace('_0001', '');
    //             dtmedia.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/mediaadsfile/' + supportFile_filename_new;
    //             dtmedia.mediaMime = supportFile_mimetype;
    //             dtmedia.mediaType = type;

    //             let dataimageads = await this.mediaimageadsService.create(dtmedia);
    //             idmedia = dataimageads._id;
    //         }

    //         else if (typemedia === "video") {
    //             //Var cardPict
    //             let cardVid_data = null;
    //             let cardVid_filename = '';
    //             let cardVid_etx = '';
    //             let cardVid_mimetype = '';
    //             let cardVid_name = '';
    //             let cardVid_filename_new = '';
    //             let cardVid_local_path = '';
    //             let cardVid_seaweedfs_path = '';
    //             //Var supportFile
    //             let supportFile_data = null;
    //             let supportFile_filename = '';
    //             let supportFile_etx = '';
    //             let supportFile_mimetype = '';
    //             let supportFile_name = '';
    //             let supportFile_filename_new = '';
    //             let supportFile_local_path = '';
    //             let supportFile_seaweedfs_path = '';

    //             if (files.mediaAdsFile != undefined) {
    //                 var FormData_ = new FormData();
    //                 supportFile_data = files.mediaAdsFile[0];
    //                 supportFile_mimetype = files.mediaAdsFile[0].mimetype;
    //                 supportFile_filename = files.mediaAdsFile[0].filename;
    //                 supportFile_etx = supportFile_filename.substring(supportFile_filename.lastIndexOf('.') + 1, supportFile_filename.length);
    //                 supportFile_name = supportFile_filename.substring(0, supportFile_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 supportFile_filename_new = mongoose_gen_meida + '_thumb.' + supportFile_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + supportFile_filename, './temp/' + supportFile_filename_new);

    //                 //Local path
    //                 supportFile_local_path = './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new;
    //                 //SeaweedFs path
    //                 supportFile_seaweedfs_path = '/' + mongoose_gen_meida + '/mediaadsfile/thumb/';

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + supportFile_filename_new, './temp/' + mongoose_gen_meida + '/' + supportFile_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }

    //                 //Upload Seaweedfs
    //                 try {
    //                     FormData_.append('proofpict', fs.createReadStream(path.resolve(supportFile_local_path)));
    //                     await this.seaweedfsService.write(supportFile_seaweedfs_path, FormData_);
    //                 } catch (err) {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed proofpict failed upload seaweedfs',
    //                     );
    //                 }
    //             }
    //             if (files.mediaVidFile != undefined) {
    //                 var FormData_ = new FormData();
    //                 cardVid_data = files.mediaVidFile[0];
    //                 cardVid_mimetype = files.mediaVidFile[0].mimetype;
    //                 cardVid_filename = files.mediaVidFile[0].filename;
    //                 cardVid_etx = cardVid_filename.substring(cardVid_filename.lastIndexOf('.') + 1, cardVid_filename.length);
    //                 cardVid_name = cardVid_filename.substring(0, cardVid_filename.lastIndexOf('.'));

    //                 //New Name file supportFile
    //                 cardVid_filename_new = mongoose_gen_meida + '.' + cardVid_etx;
    //                 //Rename Name file supportFile
    //                 fs.renameSync('./temp/' + cardVid_filename, './temp/' + cardVid_filename_new);

    //                 //Local path
    //                 cardVid_local_path = './temp/' + mongoose_gen_meida + '/' + cardVid_filename_new;
    //                 //SeaweedFs path
    //                 cardVid_seaweedfs_path = '/' + mongoose_gen_meida + '/mediaadsfile/vid/';

    //                 //Create Folder Id
    //                 if (await this.utilsService.createFolder('./temp/', mongoose_gen_meida)) {

    //                     await fse.move('./temp/' + cardVid_filename_new, './temp/' + mongoose_gen_meida + '/' + cardVid_filename_new);
    //                 } else {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed create folder ' + mongoose_gen_meida,
    //                     );
    //                 }

    //                 //Upload Seaweedfs
    //                 try {
    //                     FormData_.append('proofpict', fs.createReadStream(path.resolve(cardVid_local_path)));
    //                     await this.seaweedfsService.write(cardVid_seaweedfs_path, FormData_);
    //                 } catch (err) {
    //                     await this.errorHandler.generateNotAcceptableException(
    //                         'Unabled to proceed proofpict failed upload seaweedfs'
    //                     );

    //                 }
    //             }

    //             else {
    //                 await this.errorHandler.generateNotAcceptableException(
    //                     'Unabled to proceed mediaAdsFile is required',
    //                 );
    //             }
    //             var name = cardVid_mimetype;
    //             var splitname = name.split('/');
    //             var type = splitname[0];

    //             var dt = new Date(Date.now());
    //             dt.setHours(dt.getHours() + 7); // timestamp
    //             dt = new Date(dt);
    //             let dtmedia = new MediavodeosadsDto();
    //             dtmedia.active = true;
    //             dtmedia.createdAt = dt.toISOString();
    //             dtmedia.updatedAt = dt.toISOString();
    //             dtmedia.mediaBasePath = mongoose_gen_meida + '/mediaadsfile/vid/';
    //             dtmedia.mediaUri = cardVid_filename_new;
    //             dtmedia.originalName = cardVid_filename;
    //             dtmedia.fsSourceUri = '/localrepo/' + mongoose_gen_meida + '/mediaadsfile/vid/' + cardVid_filename_new;
    //             dtmedia.fsSourceName = cardVid_filename_new;
    //             dtmedia.fsTargetUri = '/localrepo/' + mongoose_gen_meida + '/mediaadsfile/vid/' + cardVid_filename_new;
    //             dtmedia.fsTargetThumbUri = '/localrepo/' + mongoose_gen_meida + '/mediaadsfile/thumb/' + supportFile_filename_new;
    //             dtmedia.mediaMime = cardVid_mimetype;
    //             dtmedia.mediaType = typemedia;
    //             dtmedia.mediaThumb = supportFile_filename_new;

    //             let datavideosads = await this.mediavideosadsService.create(dtmedia);

    //             idmedia = datavideosads._id;



    //         }

    //         // Delete directory recursively
    //         fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
    //             if (err) {
    //                 throw err;
    //             }
    //         });
    //         var iduser = ubasic._id;
    //         var dt = new Date(Date.now());
    //         dt.setHours(dt.getHours() + 7); // timestamp
    //         dt = new Date(dt);
    //         var dtexpired = new Date(CreateAdsDto.expiredAt);

    //         var dataUservoucher = null;
    //         var arrObjinterest = [];
    //         var arrayInterest = [];
    //         var arrayUservoucher = [];
    //         var totalCreditusvoucher = 0;


    //         try {
    //             dataUservoucher = await this.uservouchersService.findUser(mongoose.Types.ObjectId(iduser));


    //         } catch (e) {
    //             dataUservoucher = null;

    //         }


    //         if (dataUservoucher !== null) {

    //             for (var x = 0; x < dataUservoucher.length; x++) {
    //                 totalCreditusvoucher += dataUservoucher[x].totalCredit;

    //             }
    //             try {
    //                 var reqdemografisID = mongoose.Types.ObjectId(CreateAdsDto.demografisID);

    //                 var demografisIDs = { "$ref": "cities", "$id": reqdemografisID, "$db": "hyppe_infra_db" };

    //                 var reqinterestID = CreateAdsDto.interestID;
    //                 var splitreq = reqinterestID.toString();
    //                 var splitreq2 = splitreq.split(',');

    //                 for (var i = 0; i < splitreq2.length; i++) {
    //                     var id = splitreq2[i];
    //                     var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(id), "$db": "hyppe_infra_db" }
    //                     arrayInterest.push(objintr);
    //                 }

    //                 var userVoucherID = CreateAdsDto.userVoucherID;
    //                 var splituserv = userVoucherID.toString();
    //                 var splituserv2 = splituserv.split(',');
    //                 var sumCreditValue = 0;
    //                 var sumFreeCredit = 0;
    //                 var sumCredittotal = 0;

    //                 var total_credit_data = creditValue * tayang;
    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     var idu = splituserv2[i];

    //                     uservoucherdata = await this.uservouchersService.findOne(idu);
    //                     var voucherid = uservoucherdata.voucherID;

    //                     datavoucher = await this.vouchersService.findOne(voucherid);
    //                     var valueCredit = datavoucher.creditValue;
    //                     var freeCredit = datavoucher.creditPromo;
    //                     var creditTotal = datavoucher.creditTotal;

    //                     arrayCreditvalue.push(valueCredit);
    //                     arrayFreeCredit.push(freeCredit);
    //                     arrayTotalCredit.push(creditTotal);

    //                     var objuservoucher = mongoose.Types.ObjectId(idu);
    //                     arrayUservoucher.push(objuservoucher);
    //                 }

    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     sumCreditValue += arrayCreditvalue[i];
    //                     sumFreeCredit += arrayFreeCredit[i];
    //                     sumCredittotal += arrayTotalCredit[i];
    //                 }

    //                 if (totalCreditusvoucher < (creditValue * tayang)) {

    //                     res.status(HttpStatus.BAD_REQUEST).json({

    //                         "message": "Voucher credit is not sufficient, please buy a voucher first"
    //                     });
    //                 }

    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     var idu = splituserv2[i];
    //                     uservoucherdata = await this.uservouchersService.findOne(idu);
    //                     var kredit = uservoucherdata.credit;
    //                     var kreditFree = uservoucherdata.creditFree;
    //                     var totalCredit = uservoucherdata.totalCredit;

    //                     var useKredit = 0;
    //                     var useKreditFree = 0;

    //                     total_credit_data -= kredit;

    //                     if (total_credit_data == 0) {
    //                         useKredit = kredit;
    //                         totalCredit -= kredit;
    //                     } else if (total_credit_data < 0) {
    //                         useKredit = (kredit + total_credit_data);
    //                         totalCredit -= (kredit + total_credit_data);;
    //                     } else if (total_credit_data > 0) {
    //                         useKredit = kredit;
    //                         totalCredit -= kredit;
    //                         total_credit_data -= kreditFree;
    //                         if (total_credit_data == 0) {
    //                             useKreditFree = kreditFree;
    //                             totalCredit -= kreditFree;
    //                         } else if (total_credit_data < 0) {
    //                             useKreditFree = (kreditFree + total_credit_data);
    //                             totalCredit -= (kreditFree + total_credit_data);
    //                         } else if (total_credit_data > 0) {
    //                             useKreditFree = kreditFree;
    //                             totalCredit -= kreditFree;
    //                         }
    //                     }

    //                     var CreateUservouchersDto_ = new CreateUservouchersDto();
    //                     CreateUservouchersDto_.usedCredit = useKredit;
    //                     CreateUservouchersDto_.usedCreditFree = useKreditFree;
    //                     CreateUservouchersDto_.totalCredit = totalCredit;
    //                     await this.uservouchersService.update(uservoucherdata._id.toString(), CreateUservouchersDto_);
    //                 }


    //                 CreateAdsDto.timestamp = dt.toISOString();
    //                 CreateAdsDto.expiredAt = dtexpired.toISOString();
    //                 CreateAdsDto.userID = iduser;
    //                 CreateAdsDto.status = "DRAFT";
    //                 CreateAdsDto.isActive = false;
    //                 CreateAdsDto.demografisID = demografisIDs;
    //                 CreateAdsDto.totalUsedCredit = creditValue * tayang;
    //                 CreateAdsDto.userVoucherID = arrayUservoucher;
    //                 CreateAdsDto.typeAdsID = mongoose.Types.ObjectId(CreateAdsDto.typeAdsID);
    //                 CreateAdsDto.placingID = mongoose.Types.ObjectId(CreateAdsDto.placingID);
    //                 CreateAdsDto.interestID = arrayInterest;
    //                 CreateAdsDto.type = typemedia;
    //                 CreateAdsDto.usedCredit = 0;
    //                 CreateAdsDto.startAge = startAge;
    //                 CreateAdsDto.endAge = endAge;
    //                 CreateAdsDto.usedCreditFree = 0;
    //                 CreateAdsDto.creditValue = sumCreditValue;
    //                 CreateAdsDto.creditFree = sumFreeCredit;
    //                 CreateAdsDto.totalCredit = sumCredittotal;
    //                 CreateAdsDto.mediaAds = mongoose.Types.ObjectId(idmedia);;
    //                 let data = await this.adsService.create(CreateAdsDto);
    //                 res.status(HttpStatus.OK).json({
    //                     response_code: 202,
    //                     "data": data,
    //                     "message": messages
    //                 });
    //             } catch (e) {
    //                 res.status(HttpStatus.BAD_REQUEST).json({

    //                     "message": messagesEror
    //                 });
    //             }
    //         } else {
    //             res.status(HttpStatus.BAD_REQUEST).json({

    //                 "message": "Silahkan beli voucher dahulu.."
    //             });
    //         }


    //     } else {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": messagesEror
    //         });
    //     }


    // }


    // @UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.ACCEPTED)
    // @Post('createads')
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'mediaAdsFile', maxCount: 1 }, { name: 'mediaVidFile', maxCount: 1 }]))
    // async uploadsuportfile(
    //     @UploadedFiles() files: {
    //         mediaAdsFile?: Express.Multer.File[], mediaVidFile?: Express.Multer.File[]
    //     },
    //     @Body() CreateAdsDto: CreateAdsDto,
    //     @Headers() headers, @Res() res, @Req() request: Request) {

    //     var duration = null;
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }

    //     if (headers['x-auth-token'] == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed email is required',
    //         );
    //     }
    //     const messages = {
    //         "info": ["The create successful"],
    //     };

    //     const messagesEror = {
    //         "info": ["Todo is not found!"],
    //     };

    //     if (CreateAdsDto.liveTypeAds === undefined) {
    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["duration"] !== undefined) {
    //         duration = request_json["duration"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     var startAge = CreateAdsDto.startAge;
    //     var endAge = CreateAdsDto.endAge;
    //     var typeadsId = CreateAdsDto.typeAdsID;
    //     var tayang = Number(CreateAdsDto.tayang);
    //     var datatypesAds = null;

    //     var durationMin = null;
    //     var durationMax = null;
    //     var creditValue = 0;
    //     var datavoucher = null;
    //     var uservoucherdata = null;
    //     var arrayCreditvalue = [];
    //     var arrayFreeCredit = [];
    //     var arrayTotalCredit = [];
    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     var typemedia = "";
    //     var totalCreditTayang = 0;
    //     var titleMax = null;
    //     var descriptionMax = null;
    //     var nama = null;
    //     var description = null;
    //     var sizeMax = null;
    //     var size = null;
    //     nama = CreateAdsDto.name;
    //     description = CreateAdsDto.description;

    //     var lengname = nama.length;
    //     var lengdesc = description.length;
    //     try {
    //         datatypesAds = await this.adstypesService.findOne(mongoose.Types.ObjectId(typeadsId));

    //         creditValue = datatypesAds._doc.creditValue;
    //         typemedia = datatypesAds._doc.mediaType;
    //         titleMax = datatypesAds._doc.titleMax;
    //         descriptionMax = datatypesAds._doc.descriptionMax;
    //         sizeMax = datatypesAds._doc.sizeMax;
    //         durationMin = datatypesAds._doc.durationMin;
    //         durationMax = datatypesAds._doc.durationMax;

    //     } catch (e) {
    //         datatypesAds = null;
    //         creditValue = 0;
    //         typemedia = "";
    //         titleMax = 0;
    //         descriptionMax = 0;
    //         sizeMax = 0;
    //         durationMin = 0;
    //         durationMax = 0;
    //     }

    //     if (lengname > titleMax) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "Maksimal jumlah karakter judul iklan konten " + titleMax
    //         });
    //     }
    //     if (lengdesc > descriptionMax) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "Maksimal jumlah karakter deskripsi iklan konten " + descriptionMax
    //         });
    //     }
    //     if (duration > durationMax) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "Maksimal duration iklan konten " + durationMax + " detik"
    //         });
    //     } else if (duration < durationMin) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": "Minimal duration iklan konten " + durationMin + " detik"
    //         });
    //     }
    //     var mongoose_gen_meida = uuidv4();

    //     const ubasic = await this.userbasicsService.findOne(
    //         headers['x-auth-user'],
    //     );
    //     var idmedia = null;
    //     if (await this.utilsService.ceckData(ubasic)) {


    //         // Delete directory recursively
    //         // fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
    //         //     if (err) {
    //         //         throw err;
    //         //     }
    //         // });
    //         var iduser = ubasic._id;
    //         var dt = new Date(Date.now());
    //         dt.setHours(dt.getHours() + 7); // timestamp
    //         dt = new Date(dt);
    //         var dtexpired = new Date(CreateAdsDto.expiredAt);

    //         var dataUservoucher = null;
    //         var arrObjinterest = [];
    //         var arrayInterest = [];
    //         var arrayUservoucher = [];
    //         var totalCreditusvoucher = 0;

    //         var userid = mongoose.Types.ObjectId(iduser)
    //         try {
    //             dataUservoucher = await this.uservouchersService.findUser(userid);

    //         } catch (e) {
    //             dataUservoucher = null;

    //         }


    //         if (dataUservoucher !== null) {

    //             for (var x = 0; x < dataUservoucher.length; x++) {
    //                 totalCreditusvoucher += dataUservoucher[x].totalCredit;

    //             }
    //             try {
    //                 var reqdemografisID = mongoose.Types.ObjectId(CreateAdsDto.demografisID);

    //                 var demografisIDs = { "$ref": "cities", "$id": reqdemografisID, "$db": "hyppe_infra_db" };

    //                 var reqinterestID = CreateAdsDto.interestID;
    //                 var splitreq = reqinterestID.toString();
    //                 var splitreq2 = splitreq.split(',');

    //                 for (var i = 0; i < splitreq2.length; i++) {
    //                     var id = splitreq2[i];
    //                     var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(id), "$db": "hyppe_infra_db" }
    //                     arrayInterest.push(objintr);
    //                 }

    //                 var userVoucherID = CreateAdsDto.userVoucherID;
    //                 var splituserv = userVoucherID.toString();
    //                 var splituserv2 = splituserv.split(',');
    //                 var sumCreditValue = 0;
    //                 var sumFreeCredit = 0;
    //                 var sumCredittotal = 0;

    //                 var total_credit_data = creditValue * tayang;
    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     var idu = splituserv2[i];

    //                     uservoucherdata = await this.uservouchersService.findOne(idu);
    //                     var voucherid = uservoucherdata.voucherID;

    //                     datavoucher = await this.vouchersService.findOne(voucherid);
    //                     var valueCredit = datavoucher.creditValue;
    //                     var freeCredit = datavoucher.creditPromo;
    //                     var creditTotal = datavoucher.creditTotal;

    //                     arrayCreditvalue.push(valueCredit);
    //                     arrayFreeCredit.push(freeCredit);
    //                     arrayTotalCredit.push(creditTotal);

    //                     var objuservoucher = mongoose.Types.ObjectId(idu);
    //                     arrayUservoucher.push(objuservoucher);
    //                 }

    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     sumCreditValue += arrayCreditvalue[i];
    //                     sumFreeCredit += arrayFreeCredit[i];
    //                     sumCredittotal += arrayTotalCredit[i];
    //                 }

    //                 if (totalCreditusvoucher < (creditValue * tayang)) {

    //                     res.status(HttpStatus.BAD_REQUEST).json({

    //                         "message": "Voucher credit is not sufficient, please buy a voucher first"
    //                     });
    //                 }

    //                 for (var i = 0; i < splituserv2.length; i++) {
    //                     var idu = splituserv2[i];
    //                     uservoucherdata = await this.uservouchersService.findOne(idu);
    //                     var kredit = uservoucherdata.credit;
    //                     var kreditFree = uservoucherdata.creditFree;
    //                     var totalCredit = uservoucherdata.totalCredit;

    //                     var useKredit = 0;
    //                     var useKreditFree = 0;

    //                     total_credit_data -= kredit;

    //                     if (total_credit_data == 0) {
    //                         useKredit = kredit;
    //                         totalCredit -= kredit;
    //                     } else if (total_credit_data < 0) {
    //                         useKredit = (kredit + total_credit_data);
    //                         totalCredit -= (kredit + total_credit_data);;
    //                     } else if (total_credit_data > 0) {
    //                         useKredit = kredit;
    //                         totalCredit -= kredit;
    //                         total_credit_data -= kreditFree;
    //                         if (total_credit_data == 0) {
    //                             useKreditFree = kreditFree;
    //                             totalCredit -= kreditFree;
    //                         } else if (total_credit_data < 0) {
    //                             useKreditFree = (kreditFree + total_credit_data);
    //                             totalCredit -= (kreditFree + total_credit_data);
    //                         } else if (total_credit_data > 0) {
    //                             useKreditFree = kreditFree;
    //                             totalCredit -= kreditFree;
    //                         }
    //                     }

    //                     var CreateUservouchersDto_ = new CreateUservouchersDto();
    //                     CreateUservouchersDto_.usedCredit = useKredit;
    //                     CreateUservouchersDto_.usedCreditFree = useKreditFree;
    //                     CreateUservouchersDto_.totalCredit = totalCredit;
    //                     await this.uservouchersService.update(uservoucherdata._id.toString(), CreateUservouchersDto_);
    //                 }


    //                 CreateAdsDto.timestamp = dt.toISOString();
    //                 CreateAdsDto.expiredAt = dtexpired.toISOString();
    //                 CreateAdsDto.userID = iduser;
    //                 CreateAdsDto.status = "DRAFT";
    //                 CreateAdsDto.isActive = false;
    //                 CreateAdsDto.demografisID = demografisIDs;
    //                 CreateAdsDto.totalUsedCredit = creditValue * tayang;
    //                 CreateAdsDto.userVoucherID = arrayUservoucher;
    //                 CreateAdsDto.typeAdsID = mongoose.Types.ObjectId(CreateAdsDto.typeAdsID);
    //                 CreateAdsDto.placingID = mongoose.Types.ObjectId(CreateAdsDto.placingID);
    //                 CreateAdsDto.interestID = arrayInterest;
    //                 CreateAdsDto.type = typemedia;
    //                 CreateAdsDto.usedCredit = 0;
    //                 CreateAdsDto.startAge = startAge;
    //                 CreateAdsDto.endAge = endAge;
    //                 CreateAdsDto.usedCreditFree = 0;
    //                 CreateAdsDto.creditValue = sumCreditValue;
    //                 CreateAdsDto.creditFree = sumFreeCredit;
    //                 CreateAdsDto.totalCredit = sumCredittotal;
    //                 // CreateAdsDto.mediaAds = mongoose.Types.ObjectId(idmedia);;
    //                 let data = await this.adsService.create(CreateAdsDto);
    //                 var adsid = data._id.toString();
    //                 var objadsid = data._id;

    //                 if (typemedia === "image") {

    //                     let supportFile_filename = '';
    //                     let supportFile_mimetype = '';

    //                     if (files.mediaAdsFile != undefined) {
    //                         size = files.mediaAdsFile[0].size / (1024 * 1024);

    //                         if (size > sizeMax) {
    //                             res.status(HttpStatus.BAD_REQUEST).json({

    //                                 "message": "Maksimal ukuran media " + sizeMax
    //                             });
    //                         }
    //                         else {

    //                             supportFile_mimetype = files.mediaAdsFile[0].mimetype;
    //                             supportFile_filename = files.mediaAdsFile[0].originalname;

    //                             var name = supportFile_mimetype;
    //                             var splitname = name.split('/');
    //                             var type = splitname[0];

    //                             var dt = new Date(Date.now());
    //                             dt.setHours(dt.getHours() + 7); // timestamp
    //                             dt = new Date(dt);
    //                             let dtmedia = new MediaimageadsDto();
    //                             dtmedia.active = true;
    //                             dtmedia.createdAt = dt.toISOString();
    //                             dtmedia.updatedAt = dt.toISOString();
    //                             dtmedia.originalName = supportFile_filename;

    //                             dtmedia.mediaMime = supportFile_mimetype;
    //                             dtmedia.mediaType = type;

    //                             let dataimageads = await this.mediaimageadsService.create(dtmedia);
    //                             idmedia = dataimageads._id;
    //                             await this.adsService.updatemediaAds(objadsid, idmedia);

    //                             // let fn = files.mediaAdsFile[0].originalname;
    //                             // let ext = fn.split(".");
    //                             // let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + adsid + "." + ext[1];
    //                             // const ws = createWriteStream(nm);
    //                             // ws.write(files.mediaAdsFile[0].buffer);
    //                             // ws.close();

    //                             // let payload = { 'file': nm, 'postId': adsid };
    //                             // axios.post(this.configService.get("APSARA_UPLOADER_ADS_VIDEO"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
    //                             res.status(HttpStatus.OK).json({
    //                                 response_code: 202,
    //                                 "message": messages
    //                             });
    //                         }

    //                     } else {
    //                         await this.errorHandler.generateNotAcceptableException(
    //                             'Unabled to proceed mediaAdsFile is required',
    //                         );
    //                     }


    //                 }

    //                 else if (typemedia === "video") {

    //                     let cardVid_filename = '';
    //                     let cardVid_mimetype = '';

    //                     if (files.mediaVidFile != undefined) {
    //                         size = files.mediaVidFile[0].size / (1024 * 1024);

    //                         if (size > sizeMax) {
    //                             res.status(HttpStatus.BAD_REQUEST).json({

    //                                 "message": "Maksimal ukuran media " + sizeMax
    //                             });
    //                         }

    //                         else {
    //                             cardVid_mimetype = files.mediaVidFile[0].mimetype;
    //                             cardVid_filename = files.mediaVidFile[0].originalname;

    //                             var name = cardVid_mimetype;
    //                             var splitname = name.split('/');
    //                             var type = splitname[0];

    //                             var dt = new Date(Date.now());
    //                             dt.setHours(dt.getHours() + 7); // timestamp
    //                             dt = new Date(dt);
    //                             let dtmedia = new MediavodeosadsDto();
    //                             dtmedia.active = true;
    //                             dtmedia.createdAt = dt.toISOString();
    //                             dtmedia.updatedAt = dt.toISOString();
    //                             dtmedia.originalName = cardVid_filename;
    //                             dtmedia.mediaMime = cardVid_mimetype;
    //                             dtmedia.mediaType = typemedia;

    //                             let datavideosads = await this.mediavideosadsService.create(dtmedia);

    //                             idmedia = datavideosads._id;
    //                             await this.adsService.updatemediaAds(objadsid, idmedia);

    //                             let fn = files.mediaVidFile[0].originalname;
    //                             let ext = fn.split(".");
    //                             let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + adsid + "." + ext[1];
    //                             const ws = createWriteStream(nm);
    //                             ws.write(files.mediaVidFile[0].buffer);
    //                             ws.close();

    //                             let payload = { 'file': nm, 'postId': adsid };
    //                             axios.post(this.configService.get("APSARA_UPLOADER_ADS_VIDEO"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });
    //                             res.status(HttpStatus.OK).json({
    //                                 response_code: 202,
    //                                 "message": messages
    //                             });
    //                         }
    //                     }

    //                     else {
    //                         await this.errorHandler.generateNotAcceptableException(
    //                             'Unabled to proceed mediaAdsFile is required',
    //                         );
    //                     }

    //                 }

    //             } catch (e) {
    //                 res.status(HttpStatus.BAD_REQUEST).json({

    //                     "message": e.toString()
    //                 });
    //             }
    //         } else {
    //             res.status(HttpStatus.BAD_REQUEST).json({

    //                 "message": "Silahkan beli voucher dahulu.."
    //             });
    //         }


    //     } else {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": messagesEror
    //         });
    //     }


    // }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('createads')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'mediaAdsFile', maxCount: 1 }, { name: 'mediaVidFile', maxCount: 1 }]))
    async uploadsuportfile(
        @UploadedFiles() files: {
            mediaAdsFile?: Express.Multer.File[], mediaVidFile?: Express.Multer.File[]
        },
        @Body() CreateAdsDto: CreateAdsDto,
        @Headers() headers, @Res() res, @Req() request: Request) {


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
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var duration = null;
        var sizeFile = null;
        var liveTypeAds = null;
        var tipe = null;
        var idApsara = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["liveTypeAds"] !== undefined) {
            liveTypeAds = request_json["liveTypeAds"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["tipe"] !== undefined) {
            tipe = request_json["tipe"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["sizeFile"] !== undefined) {
            sizeFile = request_json["sizeFile"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["idApsara"] !== undefined) {
            idApsara = request_json["idApsara"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["duration"] !== undefined) {
            duration = request_json["duration"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var startAge = CreateAdsDto.startAge;
        var endAge = CreateAdsDto.endAge;
        var typeadsId = CreateAdsDto.typeAdsID;
        var tayang = Number(CreateAdsDto.tayang);
        var datatypesAds = null;

        var durationMin = null;
        var durationMax = null;
        var creditValue = 0;
        var datavoucher = null;
        var uservoucherdata = null;
        var arrayCreditvalue = [];
        var arrayFreeCredit = [];
        var arrayTotalCredit = [];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var totalCreditTayang = 0;
        var titleMax = null;
        var descriptionMax = null;
        var nama = null;
        var description = null;
        var sizeMax = null;
        var size = null;
        nama = CreateAdsDto.name;
        description = CreateAdsDto.description;

        var lengname = nama.length;
        var lengdesc = description.length;
        try {
            datatypesAds = await this.adstypesService.findOne(mongoose.Types.ObjectId(typeadsId));

            creditValue = datatypesAds._doc.creditValue;

            titleMax = datatypesAds._doc.titleMax;
            descriptionMax = datatypesAds._doc.descriptionMax;
            sizeMax = datatypesAds._doc.sizeMax;
            durationMin = datatypesAds._doc.durationMin;
            durationMax = datatypesAds._doc.durationMax;

        } catch (e) {
            datatypesAds = null;
            creditValue = 0;
            titleMax = 0;
            descriptionMax = 0;
            sizeMax = 0;
            durationMin = 0;
            durationMax = 0;
        }

        if (lengname > titleMax) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter judul iklan konten " + titleMax
            });
        }
        if (sizeFile > sizeMax) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal ukuran media " + sizeMax
            });
        }
        if (lengdesc > descriptionMax) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter deskripsi iklan konten " + descriptionMax
            });
        }
        if (duration > durationMax) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal duration iklan konten " + durationMax + " detik"
            });
        } else if (duration < durationMin) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Minimal duration iklan konten " + durationMin + " detik"
            });
        }
        var mongoose_gen_meida = uuidv4();

        const ubasic = await this.userbasicsService.findOne(
            headers['x-auth-user'],
        );
        var idmedia = null;
        if (await this.utilsService.ceckData(ubasic)) {


            // Delete directory recursively
            // fs.rm('./temp/' + mongoose_gen_meida, { recursive: true }, (err) => {
            //     if (err) {
            //         throw err;
            //     }
            // });
            var iduser = ubasic._id;
            var dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);
            var dtexpired = new Date(CreateAdsDto.expiredAt);

            var dataUservoucher = null;
            var arrObjinterest = [];
            var arrayInterest = [];
            var arrayUservoucher = [];
            var totalCreditusvoucher = 0;

            var userid = mongoose.Types.ObjectId(iduser)
            try {
                dataUservoucher = await this.uservouchersService.findUser(userid);

            } catch (e) {
                dataUservoucher = null;

            }


            if (dataUservoucher !== null) {

                for (var x = 0; x < dataUservoucher.length; x++) {
                    totalCreditusvoucher += dataUservoucher[x].totalCredit;

                }
                try {
                    var reqdemografisID = mongoose.Types.ObjectId(CreateAdsDto.demografisID);

                    var demografisIDs = { "$ref": "areas", "$id": reqdemografisID, "$db": "hyppe_infra_db" };

                    var reqinterestID = CreateAdsDto.interestID;
                    var splitreq = reqinterestID.toString();
                    var splitreq2 = splitreq.split(',');

                    for (var i = 0; i < splitreq2.length; i++) {
                        var id = splitreq2[i];
                        var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(id), "$db": "hyppe_infra_db" }
                        arrayInterest.push(objintr);
                    }

                    var userVoucherID = CreateAdsDto.userVoucherID;
                    var splituserv = userVoucherID.toString();
                    var splituserv2 = splituserv.split(',');
                    var sumCreditValue = 0;
                    var sumFreeCredit = 0;
                    var sumCredittotal = 0;

                    var total_credit_data = creditValue * tayang;
                    for (var i = 0; i < splituserv2.length; i++) {
                        var idu = splituserv2[i];

                        uservoucherdata = await this.uservouchersService.findOne(idu);
                        var voucherid = uservoucherdata.voucherID;

                        datavoucher = await this.vouchersService.findOne(voucherid);
                        var valueCredit = datavoucher.creditValue;
                        var freeCredit = datavoucher.creditPromo;
                        var creditTotal = datavoucher.creditTotal;

                        arrayCreditvalue.push(valueCredit);
                        arrayFreeCredit.push(freeCredit);
                        arrayTotalCredit.push(creditTotal);

                        var objuservoucher = mongoose.Types.ObjectId(idu);
                        arrayUservoucher.push(objuservoucher);
                    }

                    for (var i = 0; i < splituserv2.length; i++) {
                        sumCreditValue += arrayCreditvalue[i];
                        sumFreeCredit += arrayFreeCredit[i];
                        sumCredittotal += arrayTotalCredit[i];
                    }

                    if (totalCreditusvoucher < (creditValue * tayang)) {

                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": "Voucher credit is not sufficient, please buy a voucher first"
                        });
                    }

                    for (var i = 0; i < splituserv2.length; i++) {
                        var idu = splituserv2[i];
                        uservoucherdata = await this.uservouchersService.findOne(idu);
                        var kredit = uservoucherdata.credit;
                        var kreditFree = uservoucherdata.creditFree;
                        var totalCredit = uservoucherdata.totalCredit;

                        var useKredit = 0;
                        var useKreditFree = 0;

                        total_credit_data -= kredit;

                        if (total_credit_data == 0) {
                            useKredit = kredit;
                            totalCredit -= kredit;
                        } else if (total_credit_data < 0) {
                            useKredit = (kredit + total_credit_data);
                            totalCredit -= (kredit + total_credit_data);;
                        } else if (total_credit_data > 0) {
                            useKredit = kredit;
                            totalCredit -= kredit;
                            total_credit_data -= kreditFree;
                            if (total_credit_data == 0) {
                                useKreditFree = kreditFree;
                                totalCredit -= kreditFree;
                            } else if (total_credit_data < 0) {
                                useKreditFree = (kreditFree + total_credit_data);
                                totalCredit -= (kreditFree + total_credit_data);
                            } else if (total_credit_data > 0) {
                                useKreditFree = kreditFree;
                                totalCredit -= kreditFree;
                            }
                        }

                        var CreateUservouchersDto_ = new CreateUservouchersDto();
                        CreateUservouchersDto_.usedCredit = useKredit;
                        CreateUservouchersDto_.usedCreditFree = useKreditFree;
                        CreateUservouchersDto_.totalCredit = totalCredit;
                        await this.uservouchersService.update(uservoucherdata._id.toString(), CreateUservouchersDto_);
                    }


                    CreateAdsDto.timestamp = dt.toISOString();
                    CreateAdsDto.expiredAt = dtexpired.toISOString();
                    CreateAdsDto.userID = iduser;
                    CreateAdsDto.status = "DRAFT";
                    CreateAdsDto.isActive = false;
                    CreateAdsDto.demografisID = demografisIDs;
                    CreateAdsDto.totalUsedCredit = creditValue * tayang;
                    CreateAdsDto.userVoucherID = arrayUservoucher;
                    CreateAdsDto.typeAdsID = mongoose.Types.ObjectId(CreateAdsDto.typeAdsID);
                    CreateAdsDto.placingID = mongoose.Types.ObjectId(CreateAdsDto.placingID);
                    CreateAdsDto.interestID = arrayInterest;
                    CreateAdsDto.type = tipe;
                    CreateAdsDto.usedCredit = 0;
                    CreateAdsDto.startAge = startAge;
                    CreateAdsDto.endAge = endAge;
                    CreateAdsDto.usedCreditFree = 0;
                    CreateAdsDto.creditValue = sumCreditValue;
                    CreateAdsDto.creditFree = sumFreeCredit;
                    CreateAdsDto.totalCredit = sumCredittotal;
                    // CreateAdsDto.mediaAds = mongoose.Types.ObjectId(idmedia);;
                    let data = await this.adsService.create(CreateAdsDto);
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });

                } catch (e) {
                    res.status(HttpStatus.BAD_REQUEST).json({

                        "message": e.toString()
                    });
                }
            } else {
                res.status(HttpStatus.BAD_REQUEST).json({

                    "message": "Silahkan beli voucher dahulu.."
                });
            }


        } else {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }


    }
    @Post('notifyapsara')
    async notifyApsara(@Body() body, @Res() res, @Headers() headers) {

        var adsid = body.postId;
        var duration = body.duration;
        var url = body.url;
        var thumbnail = body.thumbnail;
        var filedel = body.filedel;
        var videoid = body.videoId;
        var data = null;
        try {
            data = await this.adsService.findOne(adsid);
            var mediaid = data.mediaAds;
            var type = data.type;

            var datamediaads = null;
            var datamediavid = null;

            if (type === "video") {
                // datamediavid = await this.mediavideosadsService.findOne(mediaid.toString());

                await this.mediavideosadsService.updatemediavidAds(mediaid, videoid, duration);
            }
            else if (type === "image") {
                // datamediaads = await this.mediaimageadsService.findOne(mediaid.toString());
                // var imageid = datamediaads.imageId;
                await this.mediaimageadsService.updatemediaAds(mediaid, videoid);
            }

            // Delete directory recursively
            fs.rm(filedel, { recursive: true }, (err) => {
                if (err) {
                    throw err;
                }
            });
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "message": "Done"
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Ads ID Not found"
            });
        }


    }
    @Post('listbyuser')
    @UseGuards(JwtAuthGuard)
    async adslistuser(@Req() request: Request): Promise<any> {

        var email = null;
        var ubasic = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        var email = null;
        var skip = 0;
        var limit = 0;
        var startdate = null;
        var enddate = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];


        const messages = {
            "info": ["The process successful"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        try {
            ubasic = await this.userbasicsService.findOne(email);
            var userid = mongoose.Types.ObjectId(ubasic._id);

        } catch (e) {
            throw new BadRequestException("User not found");
        }


        let data = await this.adsService.adsdata(userid, startdate, enddate, skip, limit);

        var totalSearch = data.length;

        return { response_code: 202, data, totalSearch, skip, limit, messages };
    }

    async parseJwt(token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };

}



