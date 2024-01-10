import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers, UseInterceptors, UploadedFiles, Put, NotAcceptableException } from '@nestjs/common';
import { MediastikerService } from './mediastiker.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Mediastiker } from './schemas/mediastiker.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { OssService } from 'src/stream/oss/oss.service';
import { isNegative } from 'class-validator';
@Controller('api/mediastiker')
export class MediastikerController {

    constructor(
        private readonly MediastikerService: MediastikerService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly osservices: OssService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 },]))
    async create(
        @UploadedFiles() files: {
            image?: Express.Multer.File[]

        },
        @Req() request: Request,
        @Res() res,
    ) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var name = null;
        var nameEn = null;
        var kategori = null;
        var status = null;
        var datastiker = null;
        var dataurut = null;
        var dataurutold = null;
        var kategori = null;
        var type = null;
        var insertdata = new Mediastiker();
        var nourut = null;
        var dataindex = null;
        var dataurutoldganti = null;

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');
        var insertdata = new Mediastiker();
        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        if (request_json["name"] !== undefined) {
            name = request_json["name"];
        } else {
            throw new BadRequestException("name required");
        }
        // if (request_json["nameEn"] !== undefined) {
        //     nameEn = request_json["nameEn"];
        // } else {
        //     throw new BadRequestException("nameEn required");
        // }


        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        } else {
            throw new BadRequestException("status required");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("type required");
        }
        if (request_json["kategori"] !== undefined) {
            kategori = request_json["kategori"];
        }
        if (request_json["nourut"] !== undefined) {
            nourut = request_json["nourut"];
        }

        if (files.image == undefined) {
            throw new BadRequestException("image required");
        }

        // } else {
        //     if (type !== "GIF") {
        //         throw new BadRequestException("kategori required");
        //     } else {

        //     }

        // }

        if (type !== "GIF") {
            try {
                datastiker = await this.MediastikerService.findByname(name, type,kategori,Number(nourut));

            } catch (e) {
                datastiker = null;

            }

            try {
                dataindex = await this.MediastikerService.findByTypekategori(type, kategori);

            } catch (e) {
                dataindex = null;

            }
            if (dataindex !== undefined && dataindex.length > 0) {
                var index = dataindex[0].index;
            }
            if (nourut !== undefined) {
                if (parseInt(nourut) > (index + 1)) {
                    throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
                }
                if (parseInt(nourut) < 1) {
                    throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
                }
            }

            //var listdatastiker = await this.MediastikerService.findByKategori(kategori);
            // var panjangdata = listdatastiker.length + 1;
            // if (parseInt(targetindex) <= 0 || parseInt(targetindex) > panjangdata) {
            //     throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
            // }



            insertdata._id = new mongoose.Types.ObjectId();
            if (datastiker !== null) {
                await this.errorHandler.generateBadRequestException(
                    'Maaf Nama Stiker tidak boleh sama',
                );
            } else {
                insertdata.name = name;
            }

            // insertdata.nameEn = nameEn;
            insertdata.createdAt = timedate;
            insertdata.updatedAt = timedate;
            insertdata.isDelete = false;
            insertdata.status = status;
            insertdata.kategori = kategori;

            if (nourut !== undefined) {
                insertdata.index = parseInt(nourut);
            } else {
                insertdata.index = index + 1;
            }

            insertdata.countused = 0;
            insertdata.countsearch = 0;
            insertdata.type = type;
            var insertMediastiker = files.image[0];
            var path = "images/mediastiker/" + insertdata._id + "_mediastiker" + "." + insertMediastiker.originalname.split(".").pop();
            var result = await this.osservices.uploadFile(insertMediastiker, path);
            var resuldata = result.url;
            insertdata.image = resuldata.replace("http", "https");


            if (nourut !== undefined) {
                try {
                    dataurut = await this.MediastikerService.findByNourut(parseInt(nourut), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
            } else {
                try {
                    dataurut = await this.MediastikerService.findByNourut(parseInt(index + 1), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
            }

            if (dataurut !== undefined && dataurut.length > 0) {
                for (let i = 0; i < dataurut.length; i++) {
                    let id = dataurut[i]._id.toString();
                    let urut = parseInt(dataurut[i].index) + 1;
                    await this.MediastikerService.updateIndex(id, urut, timedate);
                }

            }

        } else {
            insertdata._id = new mongoose.Types.ObjectId();
            if (datastiker !== null) {
                await this.errorHandler.generateBadRequestException(
                    'Maaf Nama Stiker tidak boleh sama',
                );
            } else {
                insertdata.name = name;
            }

            // insertdata.nameEn = nameEn;
            insertdata.createdAt = timedate;
            insertdata.updatedAt = timedate;
            insertdata.isDelete = false;
            insertdata.status = status;
            insertdata.kategori = null;

            // if (nourut !== undefined) {
            //     insertdata.index = parseInt(nourut);
            // } else {
            //     insertdata.index = index + 1;
            // }

            insertdata.countused = 0;
            insertdata.countsearch = 0;
            insertdata.type = type;
            var insertMediastiker = files.image[0];
            var path = "images/mediastiker/" + insertdata._id + "_mediastiker" + "." + insertMediastiker.originalname.split(".").pop();
            var result = await this.osservices.uploadFile(insertMediastiker, path);
            var resuldata = result.url;
            insertdata.image = resuldata.replace("http", "https");

        }

        try {
            await this.MediastikerService.create(insertdata);
            // if (panjangdata > 1 && (panjangdata != targetindex)) {
            //     this.sortingindex(insertdata, panjangdata, targetindex);
            // }
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": insertdata,
                "message": messages
            });
        }
        catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 },]))
    async update(
        @UploadedFiles() files: {
            image?: Express.Multer.File[]

        },
        @Req() request: Request,
        @Res() res,
    ) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var id = null;
        var name = null;
        var nameEn = null;
        var kategori = null;
        var status = null;
        var datastiker = null;
        var dataurut = null;
        var dataurutold = null;
        var insertdata = new Mediastiker();
        var nourut = null;
        var dataurutoldganti = null;
        var type = null;
        var dataindex = null;
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
        }


        // if (request_json["nameEn"] !== undefined) {
        //     nameEn = request_json["nameEn"];
        //     insertdata.nameEn = nameEn;
        // }
        if (request_json["kategori"] !== undefined) {
            kategori = request_json["kategori"];
        }

        if (request_json["nourut"] !== undefined) {
            nourut = request_json["nourut"];
        }

        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("type required");
        }
        if (request_json["name"] !== undefined) {
            name = request_json["name"];

            try {
                datastiker = await this.MediastikerService.findByname(name, type,kategori,Number(nourut));

            } catch (e) {
                datastiker = null;

            }

            if (datastiker !== null) {
                await this.errorHandler.generateBadRequestException(
                    'Maaf Nama Stiker sudah ada',
                );
            } else {
                insertdata.name = name;
            }
           
        }
        
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');


        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        if (type !== "GIF") {
            try {
                dataindex = await this.MediastikerService.findByTypekategori(type, kategori);

            } catch (e) {
                dataindex = null;

            }
            if (dataindex !== undefined && dataindex.length > 0) {
                var index = dataindex[0].index;
            }

            if (parseInt(nourut) > (index + 1)) {
                throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
            }
            if (parseInt(nourut) < 1) {
                throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
            }

            insertdata.updatedAt = timedate;
            insertdata.status = status;
            insertdata.kategori = kategori;
            insertdata.index = parseInt(nourut);
            insertdata.type = type;

            if (files.image !== undefined) {
                var insertMediastiker = files.image[0];
                var path = "images/mediastiker/" + id + "_mediastiker" + "." + insertMediastiker.originalname.split(".").pop();
                var result = await this.osservices.uploadFile(insertMediastiker, path);
                var resuldata = result.url;
                insertdata.image = resuldata.replace("http", "https");
            }

            try {
                dataurutold = await this.MediastikerService.findOne(id);

            } catch (e) {
                dataurutold = null;

            }

            try {
                dataurutoldganti = await this.MediastikerService.findByIndex(parseInt(nourut), type, kategori);

            } catch (e) {
                dataurutoldganti = null;

            }
            if (dataurutoldganti !== null) {
                var indexoldganti = dataurutoldganti.index;
                var idganti = dataurutoldganti._id.toString();
            }
            if (dataurutold !== null) {
                var indexold = dataurutold.index;
            }

            if (indexold < indexoldganti) {
                try {
                    dataurut = await this.MediastikerService.findByNourutLebihkecil(parseInt(indexold), parseInt(indexoldganti), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
                if (dataurut !== undefined && dataurut.length > 0) {
                    for (let i = 0; i < dataurut.length; i++) {
                        let id = dataurut[i]._id.toString();
                        let urut = parseInt(dataurut[i].index) - 1;
                        await this.MediastikerService.updateIndex(id, urut, timedate);
                    }

                }
            } else if (indexold > indexoldganti) {
                try {
                    dataurut = await this.MediastikerService.findByNourutLebihbesar(parseInt(indexold), parseInt(indexoldganti), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
                if (dataurut !== undefined && dataurut.length > 0) {
                    for (let i = 0; i < dataurut.length; i++) {
                        let id = dataurut[i]._id.toString();
                        let urut = parseInt(dataurut[i].index) + 1;
                        await this.MediastikerService.updateIndex(id, urut, timedate);
                    }

                }
            }

        }
        else {
            insertdata.updatedAt = timedate;
            insertdata.status = status;
            insertdata.type = type;

            if (files.image !== undefined) {
                var insertMediastiker = files.image[0];
                var path = "images/mediastiker/" + id + "_mediastiker" + "." + insertMediastiker.originalname.split(".").pop();
                var result = await this.osservices.uploadFile(insertMediastiker, path);
                var resuldata = result.url;
                insertdata.image = resuldata.replace("http", "https");
            }
        }



        try {

            await this.MediastikerService.update(id, insertdata);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": insertdata,
                "message": messages
            });
        }
        catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/v2')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 },]))
    async update2(
        @UploadedFiles() files: {
            image?: Express.Multer.File[]

        },
        @Req() request: Request,
        @Res() res,
    ) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var id = null;
        var name = null;
        var nameEn = null;
        var kategori = null;
        var status = null;
        var datastiker = null;
        var dataurut = null;
        var dataurutold = null;
        var insertdata = new Mediastiker();
        var nourut = null;
        var dataurutoldganti = null;
        var type = null;
        var dataindex = null;
        var datakategori = null;
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
        }

        if (request_json["name"] !== undefined) {
            name = request_json["name"];

            try {
                datastiker = await this.MediastikerService.findBynameTes(name);

            } catch (e) {
                datastiker = null;

            }

            if (datastiker !== null) {

            } else {
                insertdata.name = name;
            }
        }
        // if (request_json["nameEn"] !== undefined) {
        //     nameEn = request_json["nameEn"];
        //     insertdata.nameEn = nameEn;
        // }
        if (request_json["kategori"] !== undefined) {
            kategori = request_json["kategori"];

        }

        if (request_json["nourut"] !== undefined) {
            nourut = request_json["nourut"];
        } else {
            throw new BadRequestException("nourut required");
        }

        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("type required");
        }

        try {
            dataindex = await this.MediastikerService.findByTypekategoriTes(type, kategori);

        } catch (e) {
            dataindex = null;

        }
        if (dataindex !== undefined && dataindex.length > 0) {
            var index = dataindex[0].index;
        }

        if (parseInt(nourut) > (index + 1)) {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }
        if (parseInt(nourut) < 1) {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var indexoldganti = null;
        var idganti = null;
        var mongoose = require('mongoose');
        insertdata.updatedAt = timedate;
        insertdata.status = status;
        insertdata.kategori = kategori;
        insertdata.index = parseInt(nourut);
        insertdata.type = type;

        if (files.image !== undefined) {
            var insertMediastiker = files.image[0];
            var path = "images/mediastiker/" + id + "_mediastiker" + "." + insertMediastiker.originalname.split(".").pop();
            var result = await this.osservices.uploadFile(insertMediastiker, path);
            var resuldata = result.url;
            insertdata.image = resuldata.replace("http", "https");
        }



        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            dataurutold = await this.MediastikerService.findOne(id);

        } catch (e) {
            dataurutold = null;

        }

        try {
            dataurutoldganti = await this.MediastikerService.findByIndex(parseInt(nourut), type, kategori);

        } catch (e) {
            dataurutoldganti = null;

        }
        if (dataurutoldganti !== null) {
            indexoldganti = dataurutoldganti.index;
            idganti = dataurutoldganti._id.toString();
        } else {
            try {
                datakategori = await this.MediastikerService.findByTypekategori(type, kategori);

            } catch (e) {
                dataurutoldganti = null;

            }

            if (datakategori.length == 0) {
                indexoldganti = 1;
                idganti = id;
            }


        }
        if (dataurutold !== null) {
            var indexold = dataurutold.index;
            var kategoriold = dataurutold.kategori;
        }

        if (kategoriold == kategori) {
            if (indexold < indexoldganti) {
                try {
                    dataurut = await this.MediastikerService.findByNourutLebihkecilTes(parseInt(indexold), parseInt(indexoldganti), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
                if (dataurut !== undefined && dataurut.length > 0) {
                    for (let i = 0; i < dataurut.length; i++) {
                        let id = dataurut[i]._id.toString();
                        let urut = parseInt(dataurut[i].index) - 1;
                        await this.MediastikerService.updateIndex(id, urut, timedate);
                    }

                }
            } else if (indexold > indexoldganti) {
                try {
                    dataurut = await this.MediastikerService.findByNourutLebihbesarTest(parseInt(indexold), parseInt(indexoldganti), type, kategori);

                } catch (e) {
                    dataurut = null;

                }
                if (dataurut !== undefined && dataurut.length > 0) {
                    for (let i = 0; i < dataurut.length; i++) {
                        let id = dataurut[i]._id.toString();
                        let urut = parseInt(dataurut[i].index) + 1;
                        await this.MediastikerService.updateIndex(id, urut, timedate);
                    }

                }
            }
            try {

                await this.MediastikerService.update(id, insertdata);
                return res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "data": insertdata,
                    "message": messages
                });
            }
            catch (e) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    "message": messagesEror
                });
            }

        }
        else {

        }



    }


    @UseGuards(JwtAuthGuard)
    @Put('/index/update')
    async updateindex(@Req() request) {
        var id = null;
        var targetindex = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
        }

        if (request_json["targetindex"] !== undefined) {
            targetindex = request_json["targetindex"];
        } else {
            throw new BadRequestException("targetindex required");
        }

        var olddata = await this.MediastikerService.findOne(id);
        var listdatastiker = await this.MediastikerService.findByKategori(olddata.kategori);
        var panjangdata = listdatastiker.length;
        if (parseInt(targetindex) <= 0 || parseInt(targetindex) > panjangdata) {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }

        var insertdata = new Mediastiker();
        insertdata.index = targetindex;
        insertdata.updatedAt = await this.utilsService.getDateTimeString();

        if (panjangdata > 1) {
            var currentindex = olddata.index;
            var mongo = require('mongoose');
            insertdata._id = mongo.Types.ObjectId(id);
            this.sortingindex(insertdata, currentindex, targetindex);
        }
        await this.MediastikerService.update(id, insertdata);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            message: messages
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/delete/:id')
    async delete(@Param('id') id: string, @Headers() headers) {
        if (id == undefined || id == "") {
            await this.errorHandler.generateBadRequestException(
                'Param id is required',
            );
        }
        await this.MediastikerService.updateNonactive(id);
        var response = {
            "response_code": 202,
            "messages": {
                info: ['Successfuly'],
            },
        }
        return response;

    }

    @UseGuards(JwtAuthGuard)
    @Get('/trend')
    async stickertrend() {
        var data = await this.MediastikerService.trend();

        var response = {
            "response_code": 202,
            "data": data,
            "messages": {
                info: ['Successfuly'],
            },
        }
        return response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async listinggeneral(@Req() request) {
        var nama = null;
        var tipesticker = null;
        var startdate = null;
        var enddate = null;
        var kategori = null;
        var startused = null;
        var endused = null;
        var liststatus = null;

        var sorting = null;
        var page = null;
        var limit = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json['sorting'] == null && request_json['sorting'] == undefined) {
            throw new BadRequestException("Unabled to proceed, sorting field is required")
        }

        if (request_json['tipesticker'] == null && request_json['tipesticker'] == undefined) {
            throw new BadRequestException("Unabled to proceed, tipesticker field is required")
        }

        if (request_json['page'] == null && request_json['page'] == undefined) {
            throw new BadRequestException("Unabled to proceed, page field is required");
        }

        if (request_json['limit'] == null && request_json['limit'] == undefined) {
            throw new BadRequestException("Unabled to proceed, limit field is required");
        }

        tipesticker = request_json['tipesticker'];
        sorting = request_json['sorting'];
        page = request_json['page'];
        limit = request_json['limit'];

        if (request_json['nama'] != null && request_json['nama'] != undefined) {
            nama = request_json['nama'];
        }


        if (request_json['kategori'] != null && request_json['kategori'] != undefined) {
            kategori = request_json['kategori'];
        }

        if (request_json['liststatus'] != null && request_json['liststatus'] != undefined) {
            liststatus = request_json['liststatus'];
        }

        if (request_json['startused'] != null && request_json['startused'] != undefined && request_json['endused'] != null && request_json['endused'] != undefined) {
            endused = request_json['endused'];
            startused = request_json['startused'];
        }

        if (request_json['startdate'] != null && request_json['startdate'] != undefined && request_json['enddate'] != null && request_json['enddate'] != undefined) {
            enddate = request_json['enddate'];
            startdate = request_json['startdate'];
        }

        var data = await this.MediastikerService.listing(nama, tipesticker, startdate, enddate, startused, endused, kategori, liststatus, sorting, page, limit);
        var panjangdata = await this.MediastikerService.listing(nama, tipesticker, startdate, enddate, startused, endused, kategori, liststatus, null, null, null);
        var resultdata = panjangdata.length;

        var response = {
            "response_code": 202,
            "data": data,
            "totaldata": resultdata,
            "messages": {
                info: ['Successfuly'],
            },
        }
        return response;
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/status')
    async updatestatusTayang(@Request() req) {
        var request_json = JSON.parse(JSON.stringify(req.body));
        if (request_json['id'] == null || request_json['id'] == undefined) {
            throw new BadRequestException("Unabled to proceed, id field required");
        }

        if (request_json['status'] == null || request_json['status'] == undefined) {
            throw new BadRequestException("Unabled to proceed, status field required");
        }

        var id = request_json['id'];
        var status = request_json['status'];

        var updatedata = new Mediastiker();
        updatedata.status = status;

        await this.MediastikerService.update(id, updatedata);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            messages: messages,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/list')
    async multipleupdate(@Req() request) {
        var request_json = await JSON.parse(JSON.stringify(request.body));
        var status = request_json['status'];
        var listid = request_json['listid'];
        if (request_json['status'] == null && request_json['status'] == undefined) {
            throw new BadRequestException("unabled to proceed. status field is required");
        }

        if (request_json['listid'] == null && request_json['listid'] == undefined) {
            throw new BadRequestException("unabled to proceed. status field is required");
        }

        var data = await this.MediastikerService.updatejamaah(listid, status);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            message: messages
        }
    }

    @Get(':id')
    async getdatabyid(@Param('id') id: string) {
        return await this.MediastikerService.findOne(id)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/chart')
    async getdetailchartbyid(@Param('id') id: string) {
        return await this.MediastikerService.stickerchartbyId(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('listingapp')
    async listingapp(@Req() request) {
        var request_json = JSON.parse(JSON.stringify(request.body));

        // var page = request_json['page'];
        // var limit = request_json['limit'];
        var keyword = request_json['keyword'];
        var tipesticker = request_json['tipestiker'];
        // if (page == null || page == undefined) {
        //     throw new BadRequestException("Unabled to proceed, page field is required");
        // }

        // if (limit == null || limit == undefined) {
        //     throw new BadRequestException("Unabled to proceed, limit field is required");
        // }

        if (tipesticker == null || tipesticker == undefined) {
            throw new BadRequestException("Unabled to proceed, tipestiker field is required");
        }

        var data = await this.MediastikerService.listingapp(keyword, tipesticker);

        // if(keyword != null && keyword != undefined)
        // {
        //     this.countstick.updatedata(data, "search", "penjumlahan");
        // }
        return {
            response_code: 202,
            data: data
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('listingapp/count')
    async countlistingapp(@Req() request) {
        var request_json = JSON.parse(JSON.stringify(request.body));

        // var page = request_json['page'];
        // var limit = request_json['limit'];
        var keyword = request_json['keyword'];
        var tipesticker = request_json['tipestiker'];
        // if (page == null || page == undefined) {
        //     throw new BadRequestException("Unabled to proceed, page field is required");
        // }

        // if (limit == null || limit == undefined) {
        //     throw new BadRequestException("Unabled to proceed, limit field is required");
        // }

        if (keyword == null || keyword == undefined) {
            throw new BadRequestException("Unabled to proceed, keyword field is required");
        }

        if (tipesticker == null || tipesticker == undefined) {
            throw new BadRequestException("Unabled to proceed, tipestiker field is required");
        }

        var data = await this.MediastikerService.listingapp(keyword, tipesticker);

        try {
            this.updateused(data[0].data);
        }
        catch (e) {
            //emang kosong
        }

        // if(keyword != null && keyword != undefined)
        // {
        //     this.countstick.updatedata(data, "search", "penjumlahan");
        // }

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            message: messages
        }
    }

    async sortingindex(insertdata, currentindex, targetindex) {
        var data = await this.MediastikerService.findByKategori(insertdata.kategori);

        var operasi = null;
        var start = null;
        var end = null;
        if (currentindex > targetindex) {
            operasi = "tambah";
            start = targetindex - 1;
            end = currentindex;
        }
        else if (currentindex < targetindex) {
            operasi = "kurang";
            start = currentindex - 1;
            end = targetindex;
        }

        // var listdata = [];

        var timenow = await this.utilsService.getDateTimeString();
        for (var i = start; i < end; i++) {
            var convertsdata = data[i]._id;
            var converttdata = insertdata._id;
            if (convertsdata.toString() != converttdata.toString()) {
                var tempdata = null;
                if (operasi == "tambah") {
                    tempdata = data[i].index + 1;
                }
                else {
                    tempdata = data[i].index - 1;
                }

                var updatedata = new Mediastiker();
                updatedata.index = tempdata;
                updatedata.updatedAt = timenow;
                await this.MediastikerService.update(convertsdata.toString(), updatedata);
            }

            // listdata.push(data[i]);
        }
    }
    async updateused(list: any[]) {
        return await this.MediastikerService.updatedata(list, "search");
    }
}
