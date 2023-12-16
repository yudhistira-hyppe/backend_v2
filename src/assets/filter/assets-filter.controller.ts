import { Controller, Get, HttpCode, HttpStatus, UseGuards, Headers, Post, Body, Req, UseInterceptors, UploadedFiles, Query, Res, Param } from '@nestjs/common';
import { AssetsFilterService } from './assets-filter.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { CreateAssetsFilterDto, UpdateAssetsFilterDto } from './dto/create-assets-filter.dto';
import mongoose from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { OssService } from '../../stream/oss/oss.service';
import * as https from "https";
import * as http from "http";
const sharp = require('sharp');
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { CreateFilterDto } from '../filtercategory/dto/create-filter.dto';


@Controller('api/assets/filter')
export class AssetsFilterController {
    constructor(
        private readonly assetsFilterService: AssetsFilterService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly ossService: OssService,
        private readonly logapiSS: LogapisService,
    ) { }


    @UseGuards(JwtAuthGuard)
    @Post('/create')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }, { name: 'fileAsset', maxCount: 1 }]))
    @HttpCode(HttpStatus.ACCEPTED)
    async createfilter(
        @UploadedFiles() files: {
            fileAsset?: Express.Multer.File[],
            imageFile?: Express.Multer.File[]
        }, @Body() CreateAssetsFilterDto_: CreateAssetsFilterDto,
        @Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        if (CreateAssetsFilterDto_.namafile == undefined || CreateAssetsFilterDto_.namafile == "") {
            await this.errorHandler.generateBadRequestException(
                'Param namafile is required',
            );
        }

        //Generate ID
        const id = new mongoose.Types.ObjectId();
        CreateAssetsFilterDto_._id = id;

        //File Upload
        if (files.fileAsset != undefined) {
            const fileAsset = files.fileAsset[0];
            const extension = fileAsset.originalname.substring(fileAsset.originalname.lastIndexOf('.'), fileAsset.originalname.length);
            const fileAssetName = id.toString() + extension;
            const path = "asset/effect/" + id.toString() + "/" + fileAssetName;
            var result = await this.ossService.uploadFileBuffer(fileAsset.buffer, path);
            if (result != undefined) {
                if (result.res != undefined) {
                    if (result.res.statusCode != undefined) {
                        if (result.res.statusCode == 200) {
                            CreateAssetsFilterDto_.fileAssetName = fileAssetName;
                            CreateAssetsFilterDto_.fileAssetBasePath = path;
                            CreateAssetsFilterDto_.fileAssetUri = result.res.requestUrls[0];
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed failed upload Asset',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed failed upload Asset',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed upload Asset',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed upload Asset',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed failed upload Asset',
            );
        }

        //Image Upload
        if (files.imageFile != undefined) {
            const imageFile = files.imageFile[0];
            const extension = '.jpeg';
            const imageFileName_ori = id.toString() + extension;
            const imageFileName_thum = id.toString() + "_thum" + extension;
            const path_ori = "asset/effect/" + id.toString() + "/" + imageFileName_ori;
            const path_thum = "asset/effect/" + id.toString() + "/" + imageFileName_thum;

            //Get Image Information
            var image_information = await sharp(imageFile.buffer).metadata();
            var image_height = image_information.height;
            var image_width = image_information.width;
            var image_orientation = image_information.orientation;

            //Get Image Mode
            var image_mode = await this.utilsService.getImageMode(image_width, image_height);

            //Set Image Mode
            var New_height = 0;
            var New_width = 0;
            if (image_mode == "LANDSCAPE") {
                New_height = image_height;
                New_width = image_width;
            } else if (image_mode == "POTRET") {
                New_height = image_height;
                New_width = image_width;
            }

            //Set Convert
            var file_convert = null;
            file_convert = await sharp(imageFile.buffer, { failOnError: false }).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();

            
            //Generate Thumnail
            var image_information2 = await sharp(file_convert).metadata();
            var image_orientation2 = image_information2.orientation;
            var thumnail = null;
            var ori = null;
            try {
                if (image_orientation2 == 1) {
                    thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
                } else if (image_orientation2 == 6) {
                    thumnail = await sharp(file_convert).rotate(90).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
                } else if (image_orientation2 == 8) {
                    thumnail = await sharp(file_convert).rotate(270).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
                } else {
                    thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
                    ori = file_convert;
                }
                console.log(typeof thumnail);
            } catch (e) {
                console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
            }

            var result = await this.ossService.uploadFileBuffer(Buffer.from(ori), path_ori);
            var result_thum = await this.ossService.uploadFileBuffer(Buffer.from(thumnail), path_thum);
            if (result != undefined) {
                if (result.res != undefined) {
                    if (result.res.statusCode != undefined) {
                        if (result.res.statusCode == 200) {
                            CreateAssetsFilterDto_.mediaName = imageFileName_ori;
                            CreateAssetsFilterDto_.mediaBasePath = path_ori;
                            CreateAssetsFilterDto_.mediaUri = result.res.requestUrls[0]

                            CreateAssetsFilterDto_.mediaThumName = imageFileName_thum;
                            CreateAssetsFilterDto_.mediaThumBasePath = path_thum;
                            CreateAssetsFilterDto_.mediaThumUri = result_thum.res.requestUrls[0]
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed failed upload Image Asset',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed failed upload Image Asset',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed upload Image Asset',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed upload Image Asset',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed failed upload Image Asset',
            );
        }

        if(CreateAssetsFilterDto_.category_id != null && CreateAssetsFilterDto_.category_id != undefined)
        {
            var mongo = require('mongoose');
            CreateAssetsFilterDto_.category_id = new mongo.Types.ObjectId(CreateAssetsFilterDto_.category_id); 
        }
        if(CreateAssetsFilterDto_.status != null && CreateAssetsFilterDto_.status != undefined)
        {
            CreateAssetsFilterDto_.status = Boolean(CreateAssetsFilterDto_.status);
        }
        CreateAssetsFilterDto_.createdAt = await this.utilsService.getDateTimeString();
        CreateAssetsFilterDto_.updatedAt = await this.utilsService.getDateTimeString();
        this.assetsFilterService.create(CreateAssetsFilterDto_);
        return await this.errorHandler.generateAcceptResponseCodeWithData(
            "Create Assets File succesfully", CreateAssetsFilterDto_
        );
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/user')
    async getfilter(@Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {

            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        var assetsUser = await (await this.userbasicsService.findOne(headers['x-auth-user'])).userAssets;
        if (await this.utilsService.ceckData(assetsUser)) {
            assetsUser.map(function (i) {
                return new mongoose.Types.ObjectId(i);
            });
        }
        const dataAssets = await this.assetsFilterService.find(assetsUser);
        const data_ = await Promise.all(dataAssets.map(async (item, index) => {
            var fileAssetUri = "assets/filter/file/" + item._id;
            var mediaUri = "assets/filter/image/" + item._id;
            var mediaThumUri = "assets/filter/image/thum/" + item._id;
            return {
                _id: item._id,
                namafile: item.namafile,
                descFile: item.descFile,
                fileAssetName: item.fileAssetName,
                fileAssetBasePath: item.fileAssetBasePath,
                fileAssetUri: fileAssetUri,
                mediaName: item.mediaName,
                mediaBasePath: item.mediaBasePath,
                mediaUri: mediaUri,
                mediaThumName: item.mediaThumUri,
                mediaThumBasePath: item.mediaThumUri,
                mediaThumUri: mediaThumUri,
                status: item.status,
                category_id: item.category_id
            }
        }));

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return {
            response_code: 202,
            data: data_,
            messages: {
                info: ['Get assets successfully'],
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/list')
    async getList(@Headers() headers) {
        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
        const dataAssets = await this.assetsFilterService.findGet();
        const data_ = await Promise.all(dataAssets.map(async (item, index) => {
            var fileAssetUri = "assets/filter/file/" + item._id;
            var mediaUri = "assets/filter/image/" + item._id;
            var mediaThumUri = "assets/filter/image/thum/" + item._id;
            return {
                _id: item._id,
                namafile: item.namafile,
                descFile: item.descFile,
                fileAssetName: item.fileAssetName,
                fileAssetBasePath: item.fileAssetBasePath,
                fileAssetUri: fileAssetUri,
                mediaName: item.mediaName,
                mediaBasePath: item.mediaBasePath,
                mediaUri: mediaUri,
                mediaThumName: item.mediaThumUri,
                mediaThumBasePath: item.mediaThumUri,
                mediaThumUri: mediaThumUri,
                status: item.status,
            }
        }));
        return {
            response_code: 202,
            data: data_,
            messages: {
                info: ['Get assets successfully'],
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/listconsole')
    async listConsole(@Headers() headers, @Req() request) {
        var nama = null;
        var startdate = null;
        var enddate = null;
        var kategori = null;
        var status = null;
        var page = null;
        var limit = null;
        var sorting = null;
        
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var request_json = JSON.parse(JSON.stringify(request.body));

        if(request_json['keyword'] != null && request_json['keyword'] != undefined)
        {
            nama = request_json['keyword'];
        }

        if(request_json['startdate'] != null && request_json['startdate'] != undefined && request_json['enddate'] != null && request_json['enddate'] != undefined)
        {
            startdate = request_json['startdate'];
            enddate = request_json['enddate'];
        }

        if(request_json['kategori'] != null && request_json['kategori'] != undefined)
        {
            kategori = request_json['kategori'];
        }

        if(request_json['status'] != null && request_json['status'] != undefined)
        {
            status = request_json['status'];
        }

        if(request_json['page'] == null || request_json['page'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, page field is required',
            );
        }

        if(request_json['limit'] == null || request_json['limit'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, limit field is required',
            );
        }

        if(request_json['ascending'] == null || request_json['ascending'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ascending field is required',
            );
        }

        var page = request_json['page'];
        var limit = request_json['limit'];
        var sorting = request_json['ascending'];

        var data = await this.assetsFilterService.indexConsole(nama, startdate, enddate, kategori, status, page, limit, sorting);

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

        return {
            response_code: 202,
            data:data,
            messages: {
                info: ['Process successfully'],
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async updateAssets(@Headers() headers, @Body() UpdateAssetsFilterDto_: UpdateAssetsFilterDto, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString(); 

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        var profile = await this.userbasicsService.findOne(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(profile))) {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }

        if (UpdateAssetsFilterDto_.assets != undefined) {
            if (UpdateAssetsFilterDto_.assets.length < 0) {
                var fullurl = req.get("Host") + req.originalUrl;
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);
                
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, Param assets is required',
                );
            }
        } else {
            var fullurl = req.get("Host") + req.originalUrl;
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param assets is required',
            );
        }

        var _UpdateAssetsFilterDto_ = new UpdateAssetsFilterDto()
        _UpdateAssetsFilterDto_.assets = UpdateAssetsFilterDto_.assets.map(function (i) {
            return new mongoose.Types.ObjectId(i);
        });
        this.userbasicsService.updateUserAssets(headers['x-auth-user'], _UpdateAssetsFilterDto_.assets)

        var fullurl = req.get("Host") + req.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        var reqbody = JSON.parse(JSON.stringify(_UpdateAssetsFilterDto_));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        return {
            response_code: 202,
            messages: {
                info: ['Update successfully'],
            },
        };
    }

    @Get('image/:id')
    @HttpCode(HttpStatus.OK)
    async getImage(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response) {
        console.log(id);
        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var assetsFilter = await this.assetsFilterService.findOne(id);
                if (assetsFilter.mediaBasePath != undefined) {
                    const path = assetsFilter.mediaBasePath.toString();
                    var data = await this.ossService.readFile(path);
                    if (data != null) {
                        response.set("Content-Type", "image/jpeg");
                        response.send(data);
                    } else {
                        response.send(null);
                    }
                } else {
                    response.send(null);
                }
            } else {
                response.send(null);
            }
        } else {
            response.send(null);
        }
    }

    @Get('image/thumb/:id')
    @HttpCode(HttpStatus.OK)
    async getImageThum(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response) {
        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var assetsFilter = await this.assetsFilterService.findOne(id);
                if (assetsFilter.mediaThumBasePath != undefined) {
                    const path = assetsFilter.mediaThumBasePath.toString();
                    var data = await this.ossService.readFile(path);
                    if (data != null) {
                        response.set("Content-Type", "image/jpeg");
                        response.send(data);
                    } else {
                        response.send(null);
                    }
                } else {
                    response.send(null);
                }
            } else {
                response.send(null);
            }
        } else {
            response.send(null);
        }
    }

    @Get('file/:id')
    @HttpCode(HttpStatus.OK)
    async getFile(
        @Param('id') id: string,
        @Query('x-auth-token') token: string,
        @Query('x-auth-user') email: string, @Res() response) {
        console.log(id);
        if ((id != undefined) && (token != undefined) && (email != undefined)) {
            if (await this.utilsService.validasiTokenEmailParam(token, email)) {
                var assetsFilter = await this.assetsFilterService.findOne(id);
                if (assetsFilter.fileAssetUri != undefined) {
                    http.get(assetsFilter.fileAssetUri.toString(), function (file) {
                        response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
                        file.pipe(response);
                    });
                    // response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
                    // response.download(assetsFilter.fileAssetUri);
                    // const path = assetsFilter.mediaBasePath.toString();
                    // var data = await this.ossService.readFile(path);
                    // if (data != null) {
                    //     response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
                    //     response.download(data);
                    // } else {
                    //     response.download(null);
                    // }
                } else {
                    response.download(null);
                }
            } else {
                response.download(null);
            }
        } else {
            response.download(null);
        }
    }

    // @Get('image/:id')
    // @HttpCode(HttpStatus.OK)
    // async getImage(
    //     @Param('id') id: string,
    //     @Query('x-auth-token') token: string,
    //     @Query('x-auth-user') email: string, @Res() response) {
    //     console.log(id);
    //     if ((id != undefined) && (token != undefined) && (email != undefined)) {
    //         if (await this.utilsService.validasiTokenEmailParam(token, email)) {
    //             var assetsFilter = await this.assetsFilterService.findOne(id);
    //             if (assetsFilter.mediaBasePath != undefined) {
    //                 const path = assetsFilter.mediaBasePath.toString();
    //                 var data = await this.ossService.readFile(path);
    //                 if (data != null) {
    //                     response.set("Content-Type", "image/jpeg");
    //                     response.send(data);
    //                 } else {
    //                     response.send(null);
    //                 }
    //             } else {
    //                 response.send(null);
    //             }
    //         } else {
    //             response.send(null);
    //         }
    //     } else {
    //         response.send(null);
    //     }
    // }

    // @Get('image/thumb/:id')
    // @HttpCode(HttpStatus.OK)
    // async getImageThum(
    //     @Param('id') id: string,
    //     @Query('x-auth-token') token: string,
    //     @Query('x-auth-user') email: string, @Res() response) {
    //     if ((id != undefined) && (token != undefined) && (email != undefined)) {
    //         if (await this.utilsService.validasiTokenEmailParam(token, email)) {
    //             var assetsFilter = await this.assetsFilterService.findOne(id);
    //             if (assetsFilter.mediaThumBasePath != undefined) {
    //                 const path = assetsFilter.mediaThumBasePath.toString();
    //                 var data = await this.ossService.readFile(path);
    //                 if (data != null) {
    //                     response.set("Content-Type", "image/jpeg");
    //                     response.send(data);
    //                 } else {
    //                     response.send(null);
    //                 }
    //             } else {
    //                 response.send(null);
    //             }
    //         } else {
    //             response.send(null);
    //         }
    //     } else {
    //         response.send(null);
    //     }
    // }

    // @Get('file/:id')
    // @HttpCode(HttpStatus.OK)
    // async getFile(
    //     @Param('id') id: string,
    //     @Query('x-auth-token') token: string,
    //     @Query('x-auth-user') email: string, @Res() response) {
    //     console.log(id);
    //     if ((id != undefined) && (token != undefined) && (email != undefined)) {
    //         if (await this.utilsService.validasiTokenEmailParam(token, email)) {
    //             var assetsFilter = await this.assetsFilterService.findOne(id);
    //             if (assetsFilter.fileAssetUri != undefined) {
    //                 http.get(assetsFilter.fileAssetUri.toString(), function (file) {
    //                     response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
    //                     file.pipe(response);
    //                 });
    //                 // response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
    //                 // response.download(assetsFilter.fileAssetUri);
    //                 // const path = assetsFilter.mediaBasePath.toString();
    //                 // var data = await this.ossService.readFile(path);
    //                 // if (data != null) {
    //                 //     response.setHeader('Content-disposition', 'attachment; filename=' + assetsFilter.fileAssetName);
    //                 //     response.download(data);
    //                 // } else {
    //                 //     response.download(null);
    //                 // }
    //             } else {
    //                 response.download(null);
    //             }
    //         } else {
    //             response.download(null);
    //         }
    //     } else {
    //         response.download(null);
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Post('/updatelist')
    async updatejamaah(@Req() req, @Headers() headers)
    {
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;

        var request_json = JSON.parse(JSON.stringify(req.body));
        if(request_json['list'] == null || request_json['list'] == undefined || request_json['list'].length == 0)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, list field is required',
            );
        }

        
        if(request_json['status'] == null || request_json['status'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, status field is required',
            );
        }

        var loopdata = request_json['list'];

        var updatedata = new CreateAssetsFilterDto();

        if (request_json['status'] == "active") {
            updatedata.status = true;
        }
        else if (request_json['status'] == "nonactive") {
            updatedata.status = false;
        }
        updatedata.updatedAt = await this.utilsService.getDateTimeString();

        var mongo = require('mongoose');
        for(var i = 0; i < loopdata.length; i++)
        {
            var konvertid = new mongo.Types.ObjectId(loopdata[i]);
            await this.assetsFilterService.update(konvertid, updatedata);
        }

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

        return {
            response_code:202,
            messages: {
                info: ['Update successfully'],
            },
        }
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'imageFile', maxCount: 1 }, { name: 'fileAsset', maxCount: 1 }]))
    @Post('/updatedata')
    async updateOne(@UploadedFiles() files: {
        fileAsset?: Express.Multer.File[],
        imageFile?: Express.Multer.File[]
    }, @Body() req:CreateAssetsFilterDto, @Headers() header)
    {
        var id = req._id;
        var mongo = require('mongoose');
        req._id = new mongo.Types.ObjectId(id);

        console.log(req);

        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = header.host + '/api/updatedata/'+id;

        //File Upload
        if (files.fileAsset != undefined) {
            const fileAsset = files.fileAsset[0];
            const extension = fileAsset.originalname.substring(fileAsset.originalname.lastIndexOf('.'), fileAsset.originalname.length);
            const fileAssetName = id + extension;
            const path = "asset/effect/" + id + "/" + fileAssetName;
            var result = await this.ossService.uploadFileBuffer(fileAsset.buffer, path);
            if (result != undefined) {
                if (result.res != undefined) {
                    if (result.res.statusCode != undefined) {
                        if (result.res.statusCode == 200) {
                            req.fileAssetName = fileAssetName;
                            req.fileAssetBasePath = path;
                            req.fileAssetUri = result.res.requestUrls[0];
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed failed upload Asset',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed failed upload Asset',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed upload Asset',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed upload Asset',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed failed upload Asset',
            );
        }

        //Image Upload
        if (files.imageFile != undefined) {
            const imageFile = files.imageFile[0];
            const extension = '.jpeg';
            const imageFileName_ori = id + extension;
            const imageFileName_thum = id + "_thum" + extension;
            const path_ori = "asset/effect/" + id + "/" + imageFileName_ori;
            const path_thum = "asset/effect/" + id + "/" + imageFileName_thum;

            console.log(path_ori);
            console.log(path_thum);


            //Get Image Information
            var image_information = await sharp(imageFile.buffer).metadata();
            var image_height = image_information.height;
            var image_width = image_information.width;
            var image_orientation = image_information.orientation;

            //Get Image Mode
            var image_mode = await this.utilsService.getImageMode(image_width, image_height);

            //Set Image Mode
            var New_height = 0;
            var New_width = 0;
            if (image_mode == "LANDSCAPE") {
                New_height = image_height;
                New_width = image_width;
            } else if (image_mode == "POTRET") {
                New_height = image_height;
                New_width = image_width;
            }

            //Set Convert
            var file_convert = null;
            file_convert = await sharp(imageFile.buffer, { failOnError: false }).resize(Math.round(New_width), Math.round(New_height)).withMetadata({ image_orientation }).toBuffer();

            
            //Generate Thumnail
            var image_information2 = await sharp(file_convert).metadata();
            var image_orientation2 = image_information2.orientation;
            var thumnail = null;
            var ori = null;
            try {
                if (image_orientation2 == 1) {
                    thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).resize(Math.round(New_width), Math.round(New_height)).toBuffer();
                } else if (image_orientation2 == 6) {
                    thumnail = await sharp(file_convert).rotate(90).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).rotate(90).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
                } else if (image_orientation2 == 8) {
                    thumnail = await sharp(file_convert).rotate(270).resize(100, 100).toBuffer();
                    ori = await sharp(file_convert).rotate(270).resize(Math.round(New_height), Math.round(New_width)).toBuffer();
                } else {
                    thumnail = await sharp(file_convert).resize(100, 100).toBuffer();
                    ori = file_convert;
                }
                console.log(typeof thumnail);
            } catch (e) {
                console.log("THUMNAIL", "FAILED TO CREATE THUMNAIL");
            }

            console.log()


            var result = await this.ossService.uploadFileBuffer(Buffer.from(ori), path_ori);
            var result_thum = await this.ossService.uploadFileBuffer(Buffer.from(thumnail), path_thum);
            if (result != undefined) {
                if (result.res != undefined) {
                    if (result.res.statusCode != undefined) {
                        if (result.res.statusCode == 200) {
                            req.mediaName = imageFileName_ori;
                            req.mediaBasePath = path_ori;
                            req.mediaUri = result.res.requestUrls[0]

                            req.mediaThumName = imageFileName_thum;
                            req.mediaThumBasePath = path_thum;
                            req.mediaThumUri = result_thum.res.requestUrls[0]
                        } else {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed failed upload Image Asset',
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed failed upload Image Asset',
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed failed upload Image Asset',
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed failed upload Image Asset',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed failed upload Image Asset',
            );
        }

        
        if(req.category_id != null && req.category_id != undefined)
        {
            var mongo = require('mongoose');
            req.category_id = new mongo.Types.ObjectId(req.category_id); 
        }
        if(req.status != null && req.status != undefined)
        {
            req.status = Boolean(req.status);
        }
        req.updatedAt = await this.utilsService.getDateTimeString();
        var mongo = require('mongoose');
        var konvertid = new mongo.Types.ObjectId(id);
        await this.assetsFilterService.update(konvertid, req);

        var timestamp_end = await this.utilsService.getDateTimeString();
        var requestbody = JSON.parse(JSON.stringify(req));
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, requestbody);

        return {
            response_code:202,
            messages: {
                info: ['Update data with file successfully'],
            },
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/updatedata/status/:id')
    async updateStatusOne(@Param() id:string, @Body() req:CreateAssetsFilterDto, @Headers() header)
    {
        var token = header['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = header.host + '/api/updatedata/status/'+id;

        req.updatedAt = await this.utilsService.getDateTimeString();
        var mongo = require('mongoose');
        var konvertid = new mongo.Types.ObjectId(id);
        await this.assetsFilterService.update(konvertid, req);

        var timestamp_end = await this.utilsService.getDateTimeString();
        var requestbody = JSON.parse(JSON.stringify(req));
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, requestbody);

        return {
            response_code:202,
            messages: {
                info: ['Update successfully'],
            },
        }
    }

    @Get('detail/:id')
    async getdata(@Param() id:string, @Headers() headers)
    {
        var result = await this.assetsFilterService.detail(id);
        return {
            response_code:202,
            data:result,
            messages: {
                info: ['Process successfully'],
            },
        }
    }
}
