import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException } from '@nestjs/common';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementsDto } from './dto/create-announcement.dto';
import { UserDto } from './dto/create-announcement.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
@Controller()
export class AnnouncementsController {
    constructor(private readonly announcementsService: AnnouncementsService, private readonly userbasicsService: UserbasicsService) { }
    @UseGuards(JwtAuthGuard)
    @Post('api/announcements/createall')
    async create(@Res() res, @Body() CreateAnnouncementsDto: CreateAnnouncementsDto, @Request() req) {
        var datesend = null;
        var request_json = JSON.parse(JSON.stringify(req.body));
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        if (request_json["datesend"] !== undefined) {
            datesend = request_json["datesend"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var reqdata = req.user;
        var email = reqdata.email;
        var arruser = [];
        var userid = null;
        var objuser = {};

        var ubasic = await this.userbasicsService.findOne(email);
        var ubasiclist = await this.userbasicsService.findAll();
        var lenguserbasic = ubasiclist.length;

        for (var x = 0; x < lenguserbasic; x++) {
            userid = ubasiclist[x]._id;
            objuser = { "iduser": userid };

            arruser.push(objuser);

        }

        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var dtsend = new Date(datesend);
        dtsend.setHours(dtsend.getHours() + 7); // timestamp
        dtsend = new Date(dtsend);
        CreateAnnouncementsDto.idusershare = iduser;
        CreateAnnouncementsDto.datetimeCreate = dt.toISOString();
        CreateAnnouncementsDto.datetimeSend = dtsend.toISOString();
        CreateAnnouncementsDto.Detail = arruser;
        try {
            let data = await this.announcementsService.create(CreateAnnouncementsDto);
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
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/announcements/createbyuser')
    async createby(@Res() res, @Body() CreateAnnouncementsDto: CreateAnnouncementsDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var Detail = null;
        var datesend = null;
        var request_json = JSON.parse(JSON.stringify(req.body));
        if (request_json["Detail"] !== undefined) {
            Detail = request_json["Detail"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["datesend"] !== undefined) {
            datesend = request_json["datesend"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var reqdata = req.user;
        var email = reqdata.email;
        var arruser = [];
        var userid = null;
        var objuser = {};

        var ubasic = await this.userbasicsService.findOne(email);
        var lenguserbasic = Detail.length;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idus = null;


        for (var x = 0; x < lenguserbasic; x++) {
            userid = Detail[x].iduser;
            idus = mongoose.Types.ObjectId(userid);
            objuser = { "iduser": idus };
            arruser.push(objuser);

        }

        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var dtsend = new Date(datesend);
        dtsend.setHours(dtsend.getHours() + 7); // timestamp
        dtsend = new Date(dtsend);
        CreateAnnouncementsDto.idusershare = iduser;
        CreateAnnouncementsDto.datetimeCreate = dt.toISOString();
        CreateAnnouncementsDto.datetimeSend = dtsend.toISOString();
        CreateAnnouncementsDto.Detail = arruser;
        try {
            let data = await this.announcementsService.create(CreateAnnouncementsDto);
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
    }

    @Post('api/announcements/allannouncement')
    @UseGuards(JwtAuthGuard)
    async all(): Promise<any> {
        const mongoose = require('mongoose');

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.announcementsService.viewalldata();
        if (!data) {
            throw new Error('Todo is not found!');
        }

        return { response_code: 202, data, messages };
    }

    @Post('api/announcements/bystatus')
    @UseGuards(JwtAuthGuard)
    async retrieve(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var status = null;
        var page = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["status"] !== undefined) {
            status = request_json["status"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

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


        const messages = {
            "info": ["The process successful"],
        };



        let data = await this.announcementsService.viewabystatus(status, page, limit);
        var totalallrow = data.length;
        return { response_code: 202, data, page, limit, totalallrow, messages };
    }


    @Post('api/announcements/byuser')
    @UseGuards(JwtAuthGuard)
    async byuser(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.userbasicsService.viewdatabyuser(iduser);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Put('api/announcements/:id')
    async update(@Res() res, @Param('id') id: string, @Body() createAnnouncementsDto: CreateAnnouncementsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.announcementsService.update(id, createAnnouncementsDto);
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

    @Delete('api/announcements/:id')
    async delete(@Param('id') id: string) {
        return this.announcementsService.delete(id);
    }
}

