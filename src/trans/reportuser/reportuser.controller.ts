import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ReportuserService } from './reportuser.service';
import { CreateReportsuserDto } from './dto/create-reportuser.dto';
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
    async create(@Res() res, @Body() CreateReportsuserDto: CreateReportsuserDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var type = null;
        var reportTypeId = null;
        var cekdata = null;
        var cektypeid = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        // var idadmin = mongoose.Types.ObjectId(iduseradmin);
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

                    let data = await this.reportuserService.create(CreateReportsuserDto);




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
            } else {
                var isremoved = cektypeid._doc.isRemoved;
                var id = cektypeid._id;

                if (isremoved === false) {
                    try {

                        let data = await this.reportuserService.create(CreateReportsuserDto);

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
                } else {
                    try {

                        let data = await this.reportuserService.updateid(id);

                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "message": "Update is success"
                        });
                    } catch (e) {
                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": messagesEror
                        });
                    }
                }
            }
        }





    }
}
