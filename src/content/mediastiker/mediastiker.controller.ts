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
        var kategori = null;
        var status = null;
        var datastiker = null;
        var targetindex = null;

        if (request_json["name"] !== undefined) {
            name = request_json["name"];
        } else {
            throw new BadRequestException("name required");
        }
        if (request_json["kategori"] !== undefined) {
            kategori = request_json["kategori"];
        } else {
            throw new BadRequestException("kategori required");
        }

        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        } else {
            throw new BadRequestException("status required");
        }

        if (request_json["targetindex"] !== undefined) {
            targetindex = request_json["targetindex"];
        } else {
            throw new BadRequestException("targetindex required");
        }

        if (files.image == undefined) {
            throw new BadRequestException("image required");
        }

        try {
            datastiker = await this.MediastikerService.findByname(name);

        } catch (e) {
            datastiker = null;

        }

        var listdatastiker = await this.MediastikerService.findByKategori(kategori);
        var panjangdata = listdatastiker.length + 1;
        if(parseInt(targetindex) <= 0 || parseInt(targetindex) > panjangdata)
        {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }


        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');
        var insertdata = new Mediastiker();
        insertdata._id = new mongoose.Types.ObjectId();
        if (datastiker !== null) {
            await this.errorHandler.generateBadRequestException(
                'Maaf Nama Stiker tidak boleh sama',
            );
        } else {
            insertdata.name = name;
        }

        insertdata.createdAt = timedate;
        insertdata.updatedAt = timedate;
        insertdata.isDelete = false;
        insertdata.status = status;
        insertdata.kategori = kategori;
        insertdata.index = parseInt(targetindex);
        insertdata.used = 0;
        var insertMediastiker = files.image[0];
        var path = "images/mediastiker/" + insertdata._id + "_mediastiker" + "." + "jpeg";
        var result = await this.osservices.uploadFile(insertMediastiker, path);
        insertdata.image = result.url;


        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            await this.MediastikerService.create(insertdata);
            if(panjangdata > 1 && (panjangdata != targetindex))
            {
                this.sortingindex(insertdata, panjangdata, targetindex);
            }
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
        var kategori = null;
        var status = null;
        var datastiker = null;
        var insertdata = new Mediastiker();
        var targetindex = null;
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
        }

        if (request_json["name"] !== undefined) {
            name = request_json["name"];

            try {
                datastiker = await this.MediastikerService.findByname(name);

            } catch (e) {
                datastiker = null;

            }

            if (datastiker !== null) {

            } else {
                insertdata.name = name;
            }
        }
        if (request_json["kategori"] !== undefined) {
            kategori = request_json["kategori"];
        }

        if (request_json["targetindex"] !== undefined) {
            targetindex = request_json["targetindex"];
        } else {
            throw new BadRequestException("targetindex required");
        }

        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        }

        var listdatastiker = await this.MediastikerService.findByKategori(kategori);
        var panjangdata = listdatastiker.length;
        if(parseInt(targetindex) <= 0 || parseInt(targetindex) > panjangdata)
        {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timedate = splitdate[0];
        var mongoose = require('mongoose');
        insertdata.updatedAt = timedate;
        insertdata.status = status;
        insertdata.kategori = kategori;
        insertdata.index = targetindex;


        if (files.image !== undefined) {
            var insertMediastiker = files.image[0];
            var path = "images/mediastiker/" + id + "_mediastiker" + "." + "jpeg";
            var result = await this.osservices.uploadFile(insertMediastiker, path);
            insertdata.image = result.url;
        }



        const messages = {
            "info": ["The process successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            if(panjangdata > 1)
            {
                var olddata = await this.MediastikerService.findOne(id);
                var currentindex = olddata.index;
                var mongo = require('mongoose');
                insertdata._id = mongo.Types.ObjectId(id);
                this.sortingindex(insertdata, currentindex, targetindex);
            }
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
    @Put('/index/update')
    async updateindex(@Req() request)
    {
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
        if(parseInt(targetindex) <= 0 || parseInt(targetindex) > panjangdata)
        {
            throw new BadRequestException("can't insert data to database. targetindex out of length sticker data")
        }

        var insertdata = new Mediastiker();
        insertdata.index = targetindex;
        insertdata.updatedAt = await this.utilsService.getDateTimeString();

        if(panjangdata > 1)
        {
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
            response_code : 202,
            message:messages
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

    async sortingindex(insertdata, currentindex, targetindex)
    {
        var data = await this.MediastikerService.findByKategori(insertdata.kategori);

        var operasi = null;
        var start = null;
        var end = null;
        if(currentindex > targetindex)
        {
            operasi = "tambah";
            start = targetindex - 1;
            end = currentindex;
        }
        else if(currentindex < targetindex)
        {
            operasi = "kurang";
            start = currentindex - 1;
            end = targetindex;
        }

        // var listdata = [];
        
        var timenow = await this.utilsService.getDateTimeString();
        for(var i = start; i < end; i++)
        {
            var convertsdata = data[i]._id;
            var converttdata = insertdata._id;
            if(convertsdata.toString() != converttdata.toString())
            {
                var tempdata = null;
                if(operasi == "tambah")
                {
                    tempdata = data[i].index + 1;
                }
                else
                {
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

}
