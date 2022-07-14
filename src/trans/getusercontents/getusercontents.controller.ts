import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { GetusercontentsService } from './getusercontents.service';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents } from './schemas/getusercontents.schema';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { GetcontenteventsService } from '../getusercontents/getcontentevents/getcontentevents.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly getcontenteventsService: GetcontenteventsService) { }

    @Post('api/getusercontents/all')
    @UseGuards(JwtAuthGuard)
    async contentuserall(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findalldata(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/latest')
    @UseGuards(JwtAuthGuard)
    async contentuserlatest(@Req() request: Request): Promise<any> {
        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findlatesdata(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/popular')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {
        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findpopular(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/monetize')
    @UseGuards(JwtAuthGuard)
    async contentusermonetize(@Req() request: Request): Promise<any> {
        var skip = 0;
        var limit = 0;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findmonetize(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/search')
    @UseGuards(JwtAuthGuard)
    async contentusersearch(@Req() request: Request): Promise<any> {
        var skip = 0;
        var limit = 0;
        var email = null;
        var title = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["title"] !== undefined) {
            title = request_json["title"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findsearch(email, title, skip, limit);

        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/management/all')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagement(@Req() request: Request): Promise<any> {

        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findmanagementcontentall(email);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/grouping')
    @UseGuards(JwtAuthGuard)
    async contentmanagemen(@Req() request: Request): Promise<any> {
        var data = null;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        var datapopular = await this.getusercontentsService.findmanagementcontentpopular(email);
        var popular = datapopular[0];
        var datalike = await this.getusercontentsService.findmanagementcontentlikes(email);
        var mostlikes = datalike[0];
        var datashare = await this.getusercontentsService.findmanagementcontentshare(email);
        var mostshares = datashare[0];
        var datalatepos = await this.getusercontentsService.findmanagementcontentlatepos(email);
        var latestpost = datalatepos[0];
        var datamonetize = await this.getusercontentsService.findmanagementcontentmonetize(email);
        var latestmonetize = datamonetize[0];
        var dataoener = await this.getusercontentsService.findmanagementcontentowner(email);
        var latestownership = dataoener[0];
        var dataregion = await this.getusercontentsService.findmanagementcontentregion(email);
        var recentlyregion = dataregion;
        var lengregion = dataregion.length;

        var dataregionall = await this.getusercontentsService.findmanagementcontentallregion(email);
        var totalpost = dataregionall.length;
        var datapost = [];

        var obj = {};
        for (var x = 0; x < lengregion; x++) {
            var loc = dataregion[x]._id;
            var tepost = dataregion[x].totalpost * 100 / totalpost;
            var tpost = tepost.toFixed(2);
            obj = { "_id": loc, "totalpost": tpost };
            datapost.push(obj);
        }



        var datatraffic = await this.getusercontentsService.findmanagementcontenttrafic(email);
        var traffic = datatraffic[0];
        var datamoderate = await this.getusercontentsService.findmanagementcontentmoderate(email);
        var moderate = datamoderate[0];
        data = [{
            "popular": popular, "mostlikes": mostlikes, "mostshares": mostshares, "latestpost": latestpost, "latestmonetize": latestmonetize, "latestownership": latestownership,
            "recentlyregion": datapost, "traffic": traffic, "moderate": moderate
        }];
        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/time')
    @UseGuards(JwtAuthGuard)
    async contentusertime(@Req() request: Request): Promise<any> {
        var DateDiff = require('date-diff');

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        let datatime = await this.getusercontentsService.findtime(postID);

        var createdate = datatime[0].createdAt;

        var subtahun = createdate.substring(0, 4);
        var subbulan = createdate.substring(7, 5);
        var subtanggal = createdate.substring(10, 8);
        var datatimestr = subtahun + "-" + subbulan + "-" + subtanggal;




        var today = new Date();
        var date1 = new Date(datatimestr);


        var diffDays = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
        var diffsec = Math.round(today.getTime() - date1.getTime()) / (1000) % 60;
        var diffMins = Math.round(today.getTime() - date1.getTime()) / (1000 * 60) % 60;
        var diffHrs = Math.floor(today.getTime() - date1.getTime()) / (1000 * 60 * 60) % 24;
        var days = diffDays.toFixed(0);
        var hours = diffHrs.toFixed(0);
        var minutes = diffMins.toFixed(0);;
        var seconds = diffsec.toFixed(0);
        const messages = {
            "info": ["The process successful"],
        };





        return { response_code: 202, days, hours, minutes, seconds, messages };
    }

    @Post('api/getusercontents/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetail(@Req() request: Request): Promise<any> {

        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findpostid(postID);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/all')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkonten(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findalldatakonten(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/owned')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenowned(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findalldatakontenowned(email, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/monetize')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenmonetize(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
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

        let data = await this.getusercontentsService.findalldatakontenmonetize(email, skip, limit);

        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/management/konten/posttype')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenpostype(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var postType = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postType"] !== undefined) {
            postType = request_json["postType"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenpostype(email, postType, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/daterange')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenrange(@Req() request: Request): Promise<any> {

        var email = null;
        var skip = 0;
        var limit = 0;
        var startdate = null;
        var enddate = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["startdate"] !== undefined) {
            startdate = request_json["startdate"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["enddate"] !== undefined) {
            enddate = request_json["enddate"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontendaterange(email, startdate, enddate, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/buy')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenbuy(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenbuy(userid, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/konten/group')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenfilterss(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var ownership = request_json["ownership"];
        var monetesisasi = request_json["monetesisasi"];
        var archived = request_json["archived"];
        var buy = request_json["buy"];
        var postType = request_json["postType"];
        var startdate = request_json["startdate"];
        var enddate = request_json["enddate"];


        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, postType, startdate, enddate, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/analitic')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenanalitic(@Req() request: Request): Promise<any> {

        var email = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.getusercontentsService.findpopularanalitic(email);

        return { response_code: 202, data, messages };
    }
    @Post('api/getusercontents/management/monetize')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenmonetis(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var data = null;
        var buy = null;
        var postType = null;
        var monetize = null;
        var email = null;
        var lastmonetize = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["skip"] !== undefined) {
            skip = request_json["skip"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        buy = request_json["buy"];
        monetize = request_json["monetize"];
        postType = request_json["postType"];
        lastmonetize = request_json["lastmonetize"];
        var ubasic = await this.userbasicsService.findOne(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        data = await this.getusercontentsService.findalldatakontenmonetesbuy(userid, email, buy, monetize, postType, lastmonetize, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('api/getusercontents/management/analitic/follower')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenfolowwing(@Req() request: Request): Promise<any> {

        var email = null;
        var year = null;
        var datafollower = null;
        var dataallfollower = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }



        if (request_json["year"] !== undefined) {
            year = request_json["year"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };

        datafollower = await this.getcontenteventsService.findfollower(email, year);
        dataallfollower = await this.getcontenteventsService.findfollowerall(email);
        var totalallfollower = dataallfollower[0].totalfollowerall;


        return { response_code: 202, datafollower, totalallfollower, messages };
    }
}
