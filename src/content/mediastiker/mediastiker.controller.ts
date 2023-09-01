import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers, UseInterceptors, UploadedFiles, Put, NotAcceptableException } from '@nestjs/common';
import { MediastikerService } from './mediastiker.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Mediastiker } from './schemas/mediastiker.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { OssService } from 'src/stream/oss/oss.service';
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
        var used = null;

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

        if (files.image == undefined) {
            throw new BadRequestException("image required");
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

        insertdata.createdAt = timedate;
        insertdata.isDelete = false;
        insertdata.status = status;
        insertdata.kategori = kategori;
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
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("id required");
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

        insertdata.updatedAt = timedate;


        if (files.image !== undefined) {
            var insertMediastiker = files.image[0];
            var path = "images/mediastiker/" + insertdata._id + "_mediastiker" + "." + "jpeg";
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


}
