import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, UploadedFiles, UseInterceptors, HttpCode, HttpException, Req, BadRequestException, Header } from '@nestjs/common';
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
import { AdsplacesService } from '../adsplaces/adsplaces.service';
//import { UserAdsService } from '../userads/userads.service';
import { LogapisService } from '../logapis/logapis.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
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
        private readonly adsplacesService: AdsplacesService,
        private readonly vouchersService: VouchersService,
        private readonly basic2SS: UserbasicnewService,
        private readonly logAPISS: LogapisService) { }


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
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/ads/createads";
        var email = headers['x-auth-user'];
        var reqbody = JSON.parse(JSON.stringify(request.body));

        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["tipe"] !== undefined) {
            tipe = request_json["tipe"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["sizeFile"] !== undefined) {
            sizeFile = request_json["sizeFile"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["idApsara"] !== undefined) {
            idApsara = request_json["idApsara"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["duration"] !== undefined) {
            duration = request_json["duration"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

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
        var rounding = Math.floor(duration);
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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter judul iklan konten " + titleMax
            });
        }
        if (sizeFile > sizeMax) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal ukuran media " + sizeMax
            });
        }
        if (lengdesc > descriptionMax) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter deskripsi iklan konten " + descriptionMax
            });
        }


        if (rounding > durationMax) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal duration iklan konten " + durationMax + " detik"
            });
        } else if (duration < durationMin) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

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
            // var dtexpired = new Date(CreateAdsDto.expiredAt);

            var dataUservoucher = null;
            var arrObjinterest = [];
            var arrayInterest = [];
            var arrayDemografis = [];
            var arrayGender = [];
            var arrayUservoucher = [];
            var totalCreditusvoucher = 0;
            var totalCreditusvoucherUsed = 0;

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
                    var reqdemografisID = CreateAdsDto.demografisID;

                    var splitreqdem = reqdemografisID.toString();
                    var splitreq2dem = splitreqdem.split(',');

                    for (var i = 0; i < splitreq2dem.length; i++) {
                        let iddem = splitreq2dem[i];
                        let objintrdem = { "$ref": "areas", "$id": mongoose.Types.ObjectId(iddem), "$db": "ProdAll" }
                        arrayDemografis.push(objintrdem);
                    }

                    var reqgender = CreateAdsDto.gender;

                    var splitreqgen = reqgender.toString();
                    var splitreq2gen = splitreqgen.split(',');

                    for (var i = 0; i < splitreq2gen.length; i++) {
                        let gen = splitreq2gen[i];

                        arrayGender.push(gen);
                    }



                    var reqinterestID = CreateAdsDto.interestID;
                    var splitreq = reqinterestID.toString();
                    var splitreq2 = splitreq.split(',');

                    for (var i = 0; i < splitreq2.length; i++) {
                        let id = splitreq2[i];
                        let objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(id), "$db": "ProdAll" }
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
                        totalCreditusvoucherUsed += uservoucherdata.totalCredit;
                        var voucherid = uservoucherdata.voucherID;

                        datavoucher = await this.vouchersService.findOne(voucherid);
                        var valueCredit = datavoucher.creditValue;
                        var freeCredit = datavoucher.creditPromo;
                        var creditTotal = datavoucher.creditTotal;

                        var objuservoucher = mongoose.Types.ObjectId(idu);
                        arrayUservoucher.push(objuservoucher);
                    }

                    // for (var i = 0; i < splituserv2.length; i++) {
                    //     sumCreditValue += arrayCreditvalue[i];
                    //     sumFreeCredit += arrayFreeCredit[i];
                    //     sumCredittotal += arrayTotalCredit[i];
                    // }

                    if (totalCreditusvoucherUsed < total_credit_data) {

                        return res.status(HttpStatus.BAD_REQUEST).json({

                            "message": "Voucher credit is not sufficient, please buy a voucher first"
                        });
                    }

                    var creditAllUse = false;
                    for (var i = 0; i < splituserv2.length; i++) {
                        var idu = splituserv2[i];
                        uservoucherdata = await this.uservouchersService.findOne(idu);
                        var idUserVoucher = uservoucherdata._id.toString();

                        var totalCredit = (uservoucherdata.totalCredit != undefined) ? uservoucherdata.totalCredit : 0;

                        var kredit = (uservoucherdata.credit != undefined) ? uservoucherdata.credit : 0;
                        var kreditFree = (uservoucherdata.creditFree != undefined) ? uservoucherdata.creditFree : 0;

                        var useKredit = (uservoucherdata.usedCredit != undefined) ? uservoucherdata.usedCredit : 0;
                        var useKreditFree = (uservoucherdata.usedCreditFree != undefined) ? uservoucherdata.usedCreditFree : 0;

                        var LastUseKredit = kredit - useKredit;
                        var LastUseKreditFree = kreditFree - useKreditFree


                        // sumCreditValue += 0;
                        // sumFreeCredit += 0;
                        // sumCredittotal += 0;

                        if (totalCredit > 0) {
                            if (creditAllUse) {
                                useKredit = useKredit;
                                useKreditFree = useKreditFree;
                                totalCredit = totalCredit;
                            } else {
                                if (LastUseKredit > 0) {
                                    if (total_credit_data < LastUseKredit) {
                                        sumCreditValue += total_credit_data;

                                        useKredit += total_credit_data;
                                        totalCredit -= total_credit_data;
                                        total_credit_data = 0;
                                        creditAllUse = true;
                                    } else {
                                        sumCreditValue += LastUseKredit;

                                        total_credit_data -= LastUseKredit;
                                        useKredit += LastUseKredit;
                                        totalCredit -= LastUseKredit;
                                    }
                                    if (!creditAllUse) {
                                        if (LastUseKreditFree > 0) {
                                            if (total_credit_data < LastUseKreditFree) {
                                                sumFreeCredit += total_credit_data;

                                                total_credit_data = 0;
                                                useKreditFree += total_credit_data;
                                                totalCredit -= total_credit_data;
                                                creditAllUse = true;
                                            } else {
                                                sumFreeCredit += LastUseKreditFree;

                                                total_credit_data -= LastUseKreditFree;
                                                useKreditFree += LastUseKreditFree;
                                                totalCredit -= LastUseKreditFree;
                                            }
                                        }
                                    }
                                } else if (LastUseKreditFree > 0) {
                                    if (total_credit_data < LastUseKreditFree) {
                                        sumFreeCredit += total_credit_data;

                                        useKreditFree += total_credit_data;
                                        totalCredit -= total_credit_data;
                                        total_credit_data = 0;
                                        creditAllUse = true;
                                    } else {
                                        sumFreeCredit += LastUseKreditFree;

                                        total_credit_data -= LastUseKreditFree;
                                        useKreditFree += LastUseKreditFree;
                                        totalCredit -= LastUseKreditFree;
                                    }
                                }

                                if (total_credit_data == 0) {
                                    creditAllUse = true;
                                }
                            }
                        }

                        var CreateUservouchersDto_ = new CreateUservouchersDto();
                        CreateUservouchersDto_.usedCredit = useKredit;
                        CreateUservouchersDto_.usedCreditFree = useKreditFree;
                        CreateUservouchersDto_.totalCredit = totalCredit;
                        await this.uservouchersService.update(idUserVoucher, CreateUservouchersDto_);
                    }

                    // for (var i = 0; i < splituserv2.length; i++) {
                    //     sumCreditValue += arrayCreditvalue[i];
                    //     sumFreeCredit += arrayFreeCredit[i];
                    //     sumCredittotal += arrayTotalCredit[i];
                    // }

                    //     console.log("dataPlacing", dataPlacing);

                    // if (CreateAdsDto.placingID==undefined){
                    //     var dataPlacing = await this.adsplacesService.findOneByType(CreateAdsDto.typeAdsID.toString());
                    //     CreateAdsDto.placingID = mongoose.Types.ObjectId(dataPlacing._id);
                    //     console.log("placingID Tidak Ada");
                    //     console.log("dataPlacing", dataPlacing);
                    //     console.log("placingID", CreateAdsDto.placingID);
                    // } else {
                    //     CreateAdsDto.placingID = mongoose.Types.ObjectId(CreateAdsDto.placingID);
                    //     console.log("placingID Ada");
                    //     console.log("placingID", CreateAdsDto.placingID);
                    // }

                    CreateAdsDto.timestamp = dt.toISOString();
                    //  CreateAdsDto.expiredAt = dtexpired.toISOString();
                    CreateAdsDto.userID = iduser;
                    CreateAdsDto.status = "DRAFT";
                    CreateAdsDto.isActive = false;
                    CreateAdsDto.demografisID = arrayDemografis;
                    CreateAdsDto.gender = arrayGender;
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
                    CreateAdsDto.totalCredit = sumCreditValue + sumFreeCredit;
                    // CreateAdsDto.mediaAds = mongoose.Types.ObjectId(idmedia);;
                    let data = await this.adsService.create(CreateAdsDto);

                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });

                } catch (e) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                    return res.status(HttpStatus.BAD_REQUEST).json({

                        "message": e.toString()
                    });
                }
            } else {

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                return res.status(HttpStatus.BAD_REQUEST).json({

                    "message": "Silahkan beli voucher dahulu.."
                });
            }


        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

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
    async adslistuser(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/listbyuser';

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("User not found");
        }


        let data = await this.adsService.adsdata(userid, startdate, enddate, skip, limit);

        var totalSearch = data.length;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, totalSearch, skip, limit, messages };
    }

    @Post('listadsuser')
    @UseGuards(JwtAuthGuard)
    async adslist(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/listadsuser';

        var email = null;
        var ubasic = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        var email = null;
        var page = 0;
        var limit = 0;
        var startdate = null;
        var enddate = null;
        var search = null;
        var totalsearch = null;
        var datacount = null;
        var totalpage = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        search = request_json["search"];

        const messages = {
            "info": ["The process successful"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        try {
            ubasic = await this.userbasicsService.findOne(email);
            var userid = mongoose.Types.ObjectId(ubasic._id);

        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("User not found");
        }

        // let data = await this.adsService.list(userid, search, startdate, enddate, page, limit);
        let data = await this.adsService.list2(userid, search, startdate, enddate, page, limit);

        try {
            datacount = await this.adsService.listusercount(userid, search, startdate, enddate);
            totalsearch = datacount[0].count;
        } catch (e) {
            totalsearch = 0;
        }

        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, totalsearch, totalpage, messages };
    }

    @Post('management/adscenter')
    @UseGuards(JwtAuthGuard)
    async adscenter(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/management/adscenter';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        const messages = {
            "info": ["The process successful"],
        };

        var datacount = null;
        var lengdata = null;
        var datagender = null;
        var lenggender = null;
        var sumgender = null;
        var objgender = {};
        var dataSumGender = [];
        var data = null;
        try {
            datacount = await this.userbasicsService.countuserchart();
            datacount[0].ads = await this.adsService.totalads();
            lengdata = datacount.length;
        } catch (e) {
            datacount = [];
            lengdata = 0;
        }


        if (lengdata > 0) {
            try {
                datagender = datacount[0].gender;
                lenggender = datagender.length;
            } catch (e) {
                lenggender = 0;
            }
            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    sumgender += datagender[i].count;

                }

            } else {
                sumgender = 0;
            }

            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    let count = datagender[i].count;
                    let id = datagender[i]._id;

                    let persen = count * 100 / sumgender;
                    objgender = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumGender.push(objgender);
                }

            } else {
                dataSumGender = [];
            }

        }

        data = [

            {
                "gender": dataSumGender,
                "userActive": datacount[0].userActive,
                "ads": datacount[0].ads
            }
        ];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

    @Post('management/adscenter/v2')
    @UseGuards(JwtAuthGuard)
    async adscenter2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/management/adscenter/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        const messages = {
            "info": ["The process successful"],
        };

        var datacount = null;
        var lengdata = null;
        var datagender = null;
        var lenggender = null;
        var sumgender = null;
        var objgender = {};
        var dataSumGender = [];
        var data = null;
        try {
            datacount = await this.basic2SS.countuserchart();
            datacount[0].ads = await this.adsService.totalads();
            lengdata = datacount.length;
        } catch (e) {
            datacount = [];
            lengdata = 0;
        }


        if (lengdata > 0) {
            try {
                datagender = datacount[0].gender;
                lenggender = datagender.length;
            } catch (e) {
                lenggender = 0;
            }
            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    sumgender += datagender[i].count;

                }

            } else {
                sumgender = 0;
            }

            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    let count = datagender[i].count;
                    let id = datagender[i]._id;

                    let persen = count * 100 / sumgender;
                    objgender = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumGender.push(objgender);
                }

            } else {
                dataSumGender = [];
            }

        }

        data = [

            {
                "gender": dataSumGender,
                "userActive": datacount[0].userActive,
                "ads": datacount[0].ads
            }
        ];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

    @Post('management/adscenter/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetail(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/management/adscenter/details';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var id = null;
        var startdate = null;
        var enddate = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idads = mongoose.Types.ObjectId(id);
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        const messages = {
            "info": ["The process successful"],
        };

        // let data = await this.adsService.detailAds(idads, startdate, enddate);
        let data = await this.adsService.detailAds2(idads, startdate, enddate);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }


    async parseJwt(token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };

    @Post('management/adscenter/chartanalytics')
    @UseGuards(JwtAuthGuard)
    async graphadsanalytics(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/management/adscenter/chartanalytics';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        const mongoose = require('mongoose');
        var data = [];
        var requserid = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        //console.log("masuk");
        if (request_json["userid"] !== undefined) {
            requserid = request_json["userid"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        var userid = mongoose.Types.ObjectId(requserid);

        // data = await this.adsService.getgraphadsanalytics(userid);
        data = await this.adsService.getgraphadsanalytics2(userid);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('console/adscenter/performaadschart')
    @UseGuards(JwtAuthGuard)
    async getallgraphperformads(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/console/adscenter/performaadschart';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        var data = null;
        var startdate = null;
        var enddate = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        }
        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var getdatabase = await this.adsService.getAdsanalyticsgraph(startdate, enddate);

        var getdata = [];
        var total = 0;
        try {
            getdata = getdatabase[0].data;
            total = getdatabase[0].totaldata;
        }
        catch (e) {
            getdata = [];
        }

        startdate = new Date(startdate);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var end = new Date(enddate).toISOString().split("T")[0];
        var array = [];

        //kalo lama, berarti error disini!!
        while (tempdate != end) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = getdata.find(objs => objs.createdAt === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    createdAt: tempdate,
                    totalview: 0,
                    totalclick: 0
                }
            }

            array.push(obj);
        }

        data = array;

        const messages = {
            "info": ["The process successful"],
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data: array, total: total, messages };
    }

    // @Post('console/adscenter/demographchart')
    // @UseGuards(JwtAuthGuard)
    // async getdemographchart(@Req() request: Request): Promise<any> {
    //     var data = null;
    //     var startdate = null;
    //     var enddate = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
    //         startdate = request_json["startdate"];
    //         enddate = request_json["enddate"];
    //     }
    //     // else 
    //     // {
    //     //     throw new BadRequestException("Unabled to proceed");
    //     // }

    //     var getdatabase = await this.adsService.getAdsbygender(startdate, enddate);

    //     var getdata = [];
    //     try {
    //         getdata = getdatabase[0].gender;
    //     }
    //     catch (e) {
    //         getdata = [];
    //     }

    //     var arraygender = [];
    //     var checkgender = ["OTHER", "MALE", "FEMALE"];
    //     for (var i = 0; i < checkgender.length; i++) {
    //         let obj = getdata.find(objs => objs._id === checkgender[i]);
    //         //console.log(obj);
    //         if (obj == undefined) {
    //             obj =
    //             {
    //                 _id: checkgender[i],
    //                 total: 0
    //             }
    //         }
    //         arraygender.push(obj);
    //     }

    //     var tempdata = getdatabase[0].area;
    //     tempdata.forEach(e => {
    //         e.persentase = e.persentase.toFixed(2);
    //     });

    //     data =
    //     {
    //         gender: arraygender,
    //         daerah: tempdata,
    //     }

    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     return { response_code: 202, data, messages };
    // }

    @Post('console/adscenter/listads')
    @UseGuards(JwtAuthGuard)
    async getlistads2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/console/adscenter/listads';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        var data = null;
        var page = null;
        var limit = null;
        var sorting = false;
        var status = null;
        var startdate = null;
        var mincredit = null;
        var maxcredit = null;
        var enddate = null;
        var namaads = null;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        }

        if (request_json["mincredit"] !== undefined && request_json["maxcredit"] !== undefined) {
            mincredit = Number(request_json["mincredit"]);
            maxcredit = Number(request_json["maxcredit"]);
        }

        if (request_json["limit"] !== undefined) {
            limit = (Number(request_json["limit"]) !== parseInt('0') ? Number(request_json["limit"]) : parseInt('10'));
        }

        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        }

        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        }

        if (request_json["name"] !== undefined) {
            namaads = request_json["name"];
        }

        if (request_json["descending"] !== undefined) {
            sorting = request_json["descending"];
        }
        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var getdata = null;
        var total = 0;
        try {
            // var tempdata = await this.adsService.consolegetlistads(startdate, enddate, status, mincredit, maxcredit, page, limit, sorting);
            getdata = await this.adsService.consolegetlistads2(startdate, enddate, status, mincredit, maxcredit, namaads, page, limit, sorting);
            total = getdata.length;
            // total = tempdata.length;
            // for (var i = 0; i < total; i++) {
            //     getdata = await this.adsService.getapsaraDatabaseAdsNew(tempdata, i);
            // }
        }
        catch (e) {
            getdata = [];
        }


        // try {
        //     // var resultdata = await this.adsService.consolegetlistads(startdate, enddate, status, mincredit, maxcredit, undefined, undefined, sorting);
        //     var resultdata = await this.adsService.consolegetlistads2(startdate, enddate, status, mincredit, maxcredit, namaads, undefined, undefined, sorting);
        //     var totalsearch = resultdata.length;
        // }
        // catch (e) {
        //     var resultdata = [];
        //     var totalsearch = 0;
        // }

        // var totalpage = 0;
        // var gettotal = (totalsearch / limit).toFixed(0);
        // var sisa = (totalsearch % limit);
        // if (sisa > 0 && sisa < 5) {
        //     totalpage = parseInt(gettotal) + 1;
        // }
        // else {
        //     totalpage = parseInt(gettotal);
        // }

        this.updatelistdataads();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data: getdata, totalsearch: 0, totalpage: 0, totaldatainpage: total, limit: limit, page: page, messages };
    }

    @Get('console/adscenter/historydetail/:id')
    @UseGuards(JwtAuthGuard)
    async getHistoryIklan(@Param('id') id: string, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/ads/console/adscenter/historydetail/' + id;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = null;

        data = await this.adsService.getDetailHistoryIklan(id);
        data = data[0].result;

        const messages = {
            "info": ["The process successful"],
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, messages, data }
    }

    async updatelistdataads() {
        var data = await this.adsService.getalldatabyforREPORTstatus();
        var iddata = [];

        if (data.length != 0) {
            for (var i = 0; i < data.length; i++) {
                iddata.push(data[i]._id);
            }

            var listid = [];
            const mongoose = require('mongoose');

            for (var i = 0; i < data.length; i++) {
                var setiddata = mongoose.Types.ObjectId(iddata[i]);
                listid.push(setiddata);
            }

            await this.adsService.updateStatusToBeREPORT(listid);
        }
    }
}



