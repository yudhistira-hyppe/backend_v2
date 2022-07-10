import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, BadRequestException } from '@nestjs/common';
import { FaqdetailsService } from './faqdetails.service';
import { CreateFaqdetailsDto } from './dto/create-faqdetails.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UserbasicsService } from '../../userbasics/userbasics.service';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { FaqService } from '../faqs.service';

@Controller()
export class FaqdetailsController {

    constructor(private readonly faqdetailsService: FaqdetailsService, private readonly userbasicsService: UserbasicsService, readonly faqService: FaqService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/faqs/detail')
    async create(@Res() res, @Body() CreateFaqdetailsDto: CreateFaqdetailsDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var id = null;
        var request_json = JSON.parse(JSON.stringify(req.body));
        var IdUserticket = null;

        var reqdata = req.user;
        var email = reqdata.email;

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        user: mongoose.Types.ObjectId(request_json["Idfaqs"])
        if (request_json["Idfaqs"] === undefined) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": "ID faq tidak boleh kosong"
            });

        }

        if (request_json["Idfaqs"] !== undefined) {
            id = request_json["Idfaqs"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        // status = request_json["status"];
        IdUserticket = id;
        var idusertiket = mongoose.Types.ObjectId(id);
        CreateFaqdetailsDto.IdUser = iduser;
        CreateFaqdetailsDto.datetime = dt.toISOString();
        CreateFaqdetailsDto.Idfaqs = idusertiket;
        try {
            let data = await this.faqdetailsService.create(CreateFaqdetailsDto);
            // await this.userticketsService.update(idusertiket, status);
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
    @Put('api/faqs/detail/:id')
    async update(@Res() res, @Param('id') id: string, @Body() createFaqdetailsDto: CreateFaqdetailsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.faqdetailsService.update(id, createFaqdetailsDto);
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
    @Put('api/faqs/detail/delete/:id')
    async delete(@Res() res, @Param('id') id: string) {

        const messages = {
            "info": ["The proses successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.faqdetailsService.delete(id);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

}
