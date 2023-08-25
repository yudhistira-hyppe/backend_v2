import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { BannerService } from './banner.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Banner } from './schemas/banner.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose from 'mongoose';
import { FileFieldsInterceptor } from '@nestjs/platform-express/multer';
import { OssService } from 'src/stream/oss/oss.service';
@Controller('api/banner')
export class BannerController {

    constructor(
        private readonly BannerService: BannerService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly osservices: OssService,
    ) { }

    // @UseGuards(JwtAuthGuard)
    // @Post()
    // @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }, ]))
    // async create(
    //   @UploadedFiles() files: {
    //     image?: Express.Multer.File[]

    //   },
    //   @Req() request: Request,
    //   @Res() res,
    // ) {
    //   var request_json = JSON.parse(JSON.stringify(request.body));

    //   if (files.image == undefined) {
    //     throw new BadRequestException("Unabled to proceed. banner board image is required");
    //   }
    //   var dt = new Date(Date.now());
    //   dt.setHours(dt.getHours() + 7); // timestamp
    //   dt = new Date(dt);
    //   var strdate = dt.toISOString();
    //   var repdate = strdate.replace('T', ' ');
    //   var splitdate = repdate.split('.');
    //   var timedate = splitdate[0];
    //   var mongoose = require('mongoose');
    //   var insertdata = new Banner();
    //   insertdata._id = new mongoose.Types.ObjectId();

    //   insertdata.createdAt =timedate;
    //   insertdata.active=true;
    //   insertdata.statusTayang=false;
    //   var importlib = require('mongoose');

    //   var insertbanner = files.image[0];
    //   var path = "images/challenge/" + insertdata._id + "_bannerLeaderboard" + "." + ektensileaderboard;
    //   var result = await this.osservices.uploadFile(insertbanner, path);
    //   insertdata.image =  result.url;


    //   const messages = {
    //     "info": ["The process successful"],
    //   };

    //   const messagesEror = {
    //     "info": ["Todo is not found!"],
    //   };

    //   try {
    //     await this.BannerService.create(insertdata);
    //     return res.status(HttpStatus.OK).json({
    //       response_code: 202,
    //       "data": insertdata,
    //       "message": messages
    //     });
    //   }
    //   catch (e) {
    //     return res.status(HttpStatus.BAD_REQUEST).json({
    //       "message": messagesEror
    //     });
    //   }
    // }

    @Post('listing')
    async listing(@Request() req)
    {
        var keyword = null;
        var statustayang = null;
        var startdate = null;
        var enddate = null;
        var page = null;
        var limit = null;
        var sorting = null;

        var request_json = JSON.parse(JSON.stringify(req.body));
        if(request_json['ascending'] != null && request_json['ascending'] != undefined)
        {
            sorting = request_json['ascending'];
        }
        else
        {
            throw new BadRequestException("Unabled to proceed, ascending field is required");
        }

        if(request_json['page'] != null && request_json['page'] != undefined)
        {
            page = request_json['page'];
        }
        else
        {
            throw new BadRequestException("Unabled to proceed, page field is required");
        }

        if(request_json['limit'] != null && request_json['limit'] != undefined)
        {
            limit = request_json['limit'];
        }
        else
        {
            throw new BadRequestException("Unabled to proceed, limit field is required");
        }
        
        if(request_json['keyword'] != null && request_json['keyword'] != undefined)
        {
            keyword = request_json['keyword'];
        }

        if(request_json['statustayang'] != null && request_json['statustayang'] != undefined)
        {
            statustayang = request_json['statustayang'];
        }

        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];
      
            var currentdate = new Date(new Date(request_json["enddate"]).setDate(new Date(request_json["enddate"]).getDate() + 1));
            var dateend = currentdate.toISOString().split("T")[0];
            enddate = dateend;
        }

        var data = await this.BannerService.listing(keyword, statustayang, startdate, enddate, page, limit, sorting);
        var totaldata = await this.BannerService.listing(keyword, statustayang, startdate, enddate, null, null, sorting);

        const messages = {
            "info": ["The process successful"],
        };
      
        return {
            response_code: 202,
            data: data,
            total: totaldata.length,
            messages: messages,
        };
    }

}
