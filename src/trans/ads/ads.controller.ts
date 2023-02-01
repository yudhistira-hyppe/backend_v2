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
import { AdsplacesService } from '../adsplaces/adsplaces.service';
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
        private readonly adsplacesService: AdsplacesService,
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
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter judul iklan konten " + titleMax
            });
        }
        if (sizeFile > sizeMax) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal ukuran media " + sizeMax
            });
        }
        if (lengdesc > descriptionMax) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal jumlah karakter deskripsi iklan konten " + descriptionMax
            });
        }
        if (duration > durationMax) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": "Maksimal duration iklan konten " + durationMax + " detik"
            });
        } else if (duration < durationMin) {
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
                    return res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });

                } catch (e) {
                    return res.status(HttpStatus.BAD_REQUEST).json({

                        "message": e.toString()
                    });
                }
            } else {
                return res.status(HttpStatus.BAD_REQUEST).json({

                    "message": "Silahkan beli voucher dahulu.."
                });
            }


        } else {
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

    @Post('listadsuser')
    @UseGuards(JwtAuthGuard)
    async adslist(@Req() request: Request): Promise<any> {

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
            throw new BadRequestException("User not found");
        }

        let data = await this.adsService.list(userid, search, startdate, enddate, page, limit);

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
        return { response_code: 202, data, page, limit, totalsearch, totalpage, messages };
    }

    @Post('management/adscenter')
    @UseGuards(JwtAuthGuard)
    async adscenter(@Req() request: Request): Promise<any> {
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
            datacount = await this.userbasicsService.countBy();
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
        return { response_code: 202, data, messages };
    }

    @Post('management/adscenter/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetail(@Req() request: Request): Promise<any> {

        var id = null;
        var startdate = null;
        var enddate = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
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

        let data = await this.adsService.detailAds(idads, startdate, enddate);

        return { response_code: 202, data, messages };
    }


    async parseJwt(token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };

    @Post('management/adscenter/chartanalytics')
    @UseGuards(JwtAuthGuard)
    async graphadsanalytics(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var data = [];
        var requserid = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        //console.log("masuk");
        if (request_json["userid"] !== undefined) {
            requserid = request_json["userid"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        var userid = mongoose.Types.ObjectId(requserid);

        data = await this.adsService.getgraphadsanalytics(userid);


        return { response_code: 202, data, messages };
    }
}



