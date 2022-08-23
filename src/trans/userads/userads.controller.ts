import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards, Request, BadRequestException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserAdsService } from './userads.service';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { AdsService } from '../ads/ads.service';
@Controller()
export class UserAdsController {
    constructor(private readonly userAdsService: UserAdsService,
        private readonly adsService: AdsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('api/userads/update')
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
        var lenghtuserads = null;



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

            try {
                datauserads = await this.userAdsService.findAdsid(adsid);
                lenghtuserads = datauserads.length;

                for (var i = 0; i < lenghtuserads; i++) {
                    viewewd = datauserads[i].viewed;

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
                }


            } catch (e) {
                throw new BadRequestException("data user ads not found..");
            }




        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": e.toString()
            });
        }
    }

    @Post('api/ads/details')
    @UseGuards(JwtAuthGuard)
    async adsdetail(@Req() request: Request): Promise<any> {

        var id = null;
        var dataads = null;
        var data = null;
        var datauserads = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var request_json = JSON.parse(JSON.stringify(request.body));
        const messages = {
            "info": ["The process successful"],
        };
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }



        try {
            dataads = await this.adsService.adsdatabyid(mongoose.Types.ObjectId(id));

            var adsid = dataads[0]._id;
            try {
                datauserads = await this.userAdsService.findAdsid(mongoose.Types.ObjectId(adsid));
            } catch (e) {
                datauserads = [];
            }


            data = [{
                "_id": id,
                "mediaBasePath": dataads[0].mediaBasePath,
                "mediaUri": dataads[0].mediaUri,
                "mediaType": dataads[0].mediaType,
                "mediaThumbUri": dataads[0].mediaThumbUri,
                "mediaThumbEndpoint": dataads[0].mediaThumbEndpoint,
                "mediaEndpoint": dataads[0].mediaEndpoint,
                "fullName": dataads[0].fullName,
                "email": dataads[0].email,
                "timestamp": dataads[0].timestamp,
                "expiredAt": dataads[0].expiredAt,
                "gender": dataads[0].gender,
                "liveAt": dataads[0].liveAt,
                "name": dataads[0].name,
                "objectifitas": dataads[0].objectifitas,
                "status": dataads[0].status,
                "totalClick": dataads[0].totalClick,
                "totalUsedCredit": dataads[0].totalUsedCredit,
                "totalView": dataads[0].totalView,
                "urlLink": dataads[0].urlLink,
                "isActive": dataads[0].isActive,
                "userAds": datauserads
            }];


        } catch (e) {
            throw new BadRequestException("data not found..");
        }


        return { response_code: 202, data, messages };
    }
}
