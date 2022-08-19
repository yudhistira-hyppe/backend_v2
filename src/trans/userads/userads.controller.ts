import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserAdsService } from './userads.service';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { AdsService } from '../ads/ads.service';
@Controller('api/userads')
export class UserAdsController {
    constructor(private readonly userAdsService: UserAdsService,
        private readonly adsService: AdsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('update')
    async update(@Res() res, @Body() createUserAdsDto: CreateUserAdsDto, @Request() request) {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var adsID = null;
        var statusView = null;
        var statusClick = null;
        var data = null;
        var datauserads = null;
        var dataads = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["adsID"] !== undefined) {
            adsID = request_json["adsID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var adsid = mongoose.Types.ObjectId(adsID);
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var viewewd = null;
        var totalView = null;
        var totalClick = null;

        try {
            datauserads = await this.userAdsService.findAdsid(adsid);
            console.log(datauserads);
            viewewd = datauserads._doc.viewed;
        } catch (e) {
            throw new BadRequestException("data user ads not found..");
        }

        try {
            dataads = await this.adsService.findOne(adsID);
            console.log(dataads);
            totalView = dataads._doc.totalView;
            totalClick = dataads._doc.totalClick;
        } catch (e) {
            throw new BadRequestException("data ads not found..");
        }
        try {

            statusView = createUserAdsDto.statusView;
            statusClick = createUserAdsDto.statusClick;

            if (statusView === true) {
                createUserAdsDto.viewAt = dt.toISOString();
                createUserAdsDto.viewed = viewewd + 1;
                data = await this.userAdsService.updatesdata(adsid, createUserAdsDto);
                var ads = await this.adsService.updateStatusView(adsid, totalView + 1);
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "data": data,
                    "message": messages
                });

            }
            if (statusClick === true) {
                createUserAdsDto.clickAt = dt.toISOString();
                createUserAdsDto.viewed = viewewd + 1;
                data = await this.userAdsService.updatesdata(adsid, createUserAdsDto);
                var ads = await this.adsService.updateStatusClick(adsid, totalClick + 1);
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "data": data,
                    "message": messages
                });
            }



        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": e.toString()
            });
        }
    }
}
