import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Headers, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ReportuserService } from './reportuser.service';
import { CreateReportsuserDto, DetailReport } from './dto/create-reportuser.dto';
import { Reportuser } from './schemas/reportuser.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ReportreasonsService } from '../reportreasons/reportreasons.service';
import { RemovedreasonsService } from '../removedreasons/removedreasons.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { PostsService } from '../../content/posts/posts.service';
import { AdsService } from '../ads/ads.service';
@Controller('api/reportuser')
export class ReportuserController {

    constructor(private readonly reportuserService: ReportuserService,
        private readonly reportreasonsService: ReportreasonsService,
        private readonly removedreasonsService: RemovedreasonsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly postsService: PostsService,
        private readonly adsService: AdsService) { }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.reportuserService.findAll();

        return { response_code: 202, data, messages };
    }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers() headers, @Body() CreateReportsuserDto: CreateReportsuserDto, @Request() request) {
        var userid = null;
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        if (headers['x-auth-token'] == undefined) {
            throw new BadRequestException("Unabled to proceed email is required");
        }
        try {
            const datauserbasicsService = await this.userbasicsService.findOne(
                headers['x-auth-user'],
            );
            userid = datauserbasicsService._id;
        } catch (e) {
            throw new BadRequestException("Unabled to proceed email is required");
        }

        var type = null;
        var reportTypeId = null;
        var cekdata = null;
        var cektypeid = null;
        var iduser = null;
        var reportReasonId = null;
        var detail = [];
        var objdetail = {};
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        // var idadmin = mongoose.Types.ObjectId(iduseradmin);
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var detailreport = CreateReportsuserDto.detailReport;
        var lenghtdetail = detailreport.length;

        for (var i = 0; i < lenghtdetail; i++) {
            iduser = mongoose.Types.ObjectId(detailreport[i].userId);
            reportReasonId = mongoose.Types.ObjectId(detailreport[i].reportReasonId);

            let detailrpt = new DetailReport();
            detailrpt.userId = iduser;
            detailrpt.reportReasonId = reportReasonId;
            detailrpt.createdAt = dt.toISOString();
            detail.push(detailrpt);
        }
        try {
            type = CreateReportsuserDto.type;
        } catch (e) {
            type = "";
        }
        try {
            reportTypeId = CreateReportsuserDto.reportTypeId;
        } catch (e) {
            reportTypeId = "";
        }


        if (type === "post") {

            cekdata = await this.postsService.findOnepostID(reportTypeId);
        }
        else if (type === "account") {

            cekdata = await this.userbasicsService.findid(reportTypeId);
        }
        else if (type === "ads") {

            cekdata = await this.adsService.findOne(reportTypeId);
        }

        if (cekdata === null) {
            throw new BadRequestException("reportTypeId not found...!");
        } else {
            cektypeid = await this.reportuserService.findType(reportTypeId);

            if (cektypeid === null) {

                try {
                    CreateReportsuserDto.createdAt = dt.toISOString();
                    CreateReportsuserDto.detailReport = detail;
                    let data = await this.reportuserService.create(CreateReportsuserDto);

                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                } catch (e) {
                    res.status(HttpStatus.BAD_REQUEST).json({

                        "message": messagesEror + "" + e
                    });
                }
            } else {
                var isremoved = cektypeid._doc.isRemoved;
                var id = cektypeid._id;

                if (isremoved === false) {
                    try {
                        CreateReportsuserDto.createdAt = dt.toISOString();
                        CreateReportsuserDto.detailReport = detail;
                        let data = await this.reportuserService.create(CreateReportsuserDto);

                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "data": data,
                            "message": messages
                        });
                    } catch (e) {
                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": messagesEror + "" + e
                        });
                    }
                } else {
                    try {

                        let data = await this.reportuserService.updateid(id, userid, dt.toISOString());

                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "message": "Update is success"
                        });
                    } catch (e) {
                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": messagesEror + "" + e
                        });
                    }
                }
            }
        }





    }
}
