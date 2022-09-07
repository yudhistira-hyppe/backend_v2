import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, BadRequestException } from '@nestjs/common';
import { UserticketdetailsService } from './userticketdetails.service';
import { CreateUserticketdetailsDto } from './dto/create-userticketdetails.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UserbasicsService } from '../../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { UserticketsService } from '../usertickets.service';

@Controller()
export class UserticketdetailsController {

    constructor(private readonly userticketdetailsService: UserticketdetailsService, private readonly userbasicsService: UserbasicsService, readonly userticketsService: UserticketsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/usertickets/reply')
    async create(@Res() res, @Body() CreateUserticketdetailsDto: CreateUserticketdetailsDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };


        var request_json = JSON.parse(JSON.stringify(req.body));
        var IdUserticket = null;
        var status = null;

        var reqdata = req.user;
        var email = reqdata.email;

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        user: mongoose.Types.ObjectId(request_json["IdUserticket"])
        if (request_json["IdUserticket"] === undefined) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "ID tiket tidak boleh kosong"
            });

        }
        else if (request_json["status"] === undefined) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "status tidak boleh kosong"
            });

        }

        else {
            status = request_json["status"];
            IdUserticket = request_json["IdUserticket"];
            var idusertiket = mongoose.Types.ObjectId(request_json["IdUserticket"]);
            CreateUserticketdetailsDto.IdUser = iduser;
            CreateUserticketdetailsDto.datetime = dt.toISOString();
            CreateUserticketdetailsDto.IdUserticket = idusertiket;
            try {
                let data = await this.userticketdetailsService.create(CreateUserticketdetailsDto);
                await this.userticketsService.update(idusertiket, status);
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

    }

}
