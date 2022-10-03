import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { GetusercontentsService } from './getusercontents.service';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents } from './schemas/getusercontents.schema';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { UserauthsService } from '../userauths/userauths.service';
import { SettingsService } from '../settings/settings.service';
import { GetcontenteventsService } from '../getusercontents/getcontentevents/getcontentevents.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';
import { CountriesService } from '../../infra/countries/countries.service';
import { GetuserprofilesService } from '../getuserprofiles/getuserprofiles.service';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly getcontenteventsService: GetcontenteventsService,
        private readonly settingsService: SettingsService,
        private readonly countriesService: CountriesService,
        private readonly getuserprofilesService: GetuserprofilesService,
        private readonly userauthsService: UserauthsService,
    ) { }

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
        var dataregion = null;
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

        var datacountri = await this.countriesService.findAll();

        var lengcountri = datacountri.length;
        var dataregionall = await this.getusercontentsService.findmanagementcontentallregion(email);
        var totalpost = dataregionall.length;
        var datapost = [];
        for (var i = 0; i < lengcountri; i++) {
            var countri = datacountri[i].country;
            dataregion = await this.getusercontentsService.findmanagementcontentregion(email, countri);
            var recentlyregion = dataregion;
            var lengregion = dataregion.length;


            var obj = {};

            for (var x = 0; x < lengregion; x++) {
                var tepost = dataregion[x].totalpost * 100 / totalpost;
                var tpost = tepost.toFixed(2);
                obj = { "_id": countri, "totalpost": tepost };
                datapost.push(obj);
            }


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

        var datatotal = await this.getusercontentsService.findcountfilter(email);
        var totalAll = datatotal[0].totalpost;
        let dataFilter = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, postType, startdate, enddate, 0, totalAll);
        let data = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, postType, startdate, enddate, skip, limit);
        var totalFilter = dataFilter.length;

        return { response_code: 202, data, skip, limit, totalFilter, totalAll, messages };
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
        var startdate = request_json["startdate"];
        var enddate = request_json["enddate"];

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        var datatotal = await this.getusercontentsService.findcountfilter(email);
        var totalAll = datatotal[0].totalpost;
        let dataFilter = await this.getusercontentsService.findalldatakontenmonetesbuy(userid, email, buy, monetize, postType, lastmonetize, startdate, enddate, 0, totalAll);
        data = await this.getusercontentsService.findalldatakontenmonetesbuy(userid, email, buy, monetize, postType, lastmonetize, startdate, enddate, skip, limit);
        var totalFilter = dataFilter.length;
        return { response_code: 202, data, skip, limit, totalFilter, totalAll, messages };
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

    @Post('api/getusercontents/buy/details')
    @UseGuards(JwtAuthGuard)
    async contentuserdetailbuy(@Req() request: Request): Promise<any> {
        var data = null;
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

        let databuy = await this.getusercontentsService.findcontenbuy(postID);

        var saleAmount = databuy[0].saleAmount;
        var totalamount = 0;
        var idmdradmin = "62bd413ff37a00001a004369";
        var idvacharege = "62bd40e0f37a00001a004366";
        var datamradmin = null;
        var datavacharge = null;
        var valuecharge = null;
        try {

            datamradmin = await this.settingsService.findOne(idmdradmin);
            var valuemradmin = datamradmin._doc.value;
            var nominalmradmin = saleAmount * valuemradmin / 100;

            totalamount = saleAmount + Math.ceil(nominalmradmin);



        } catch (e) {
            totalamount = saleAmount + 0;
        }

        try {

            datavacharge = await this.settingsService.findOne(idvacharege);
            valuecharge = datavacharge._doc.value;

        } catch (e) {
            valuecharge = 0;
        }

        if (saleAmount > 0) {
            data = {

                "_id": databuy[0]._id,
                "mediaBasePath": databuy[0].mediaBasePath,
                "mediaUri": databuy[0].mediaUri,
                "mediaType": "image",
                "mediaEndpoint": databuy[0].mediaEndpoint,
                "createdAt": databuy[0].createdAt,
                "updatedAt": databuy[0].updatedAt,
                "postID": databuy[0].postID,
                "postType": databuy[0].postType,
                "description": databuy[0].description,
                "title": databuy[0].title,
                "active": databuy[0].active,
                "location": databuy[0].location,
                "tags": databuy[0].tags,
                "likes": databuy[0].likes,
                "shares": databuy[0].shares,
                "comments": databuy[0].comments,
                "isOwned": databuy[0].isOwned,
                "views": databuy[0].views,
                "privacy": databuy[0].privacy,
                "isViewed": databuy[0].isViewed,
                "allowComments": databuy[0].allowComments,
                "isCertified": databuy[0].isCertified,
                "saleLike": databuy[0].saleLike,
                "saleView": databuy[0].saleView,
                "adminFee": Math.ceil(nominalmradmin),
                "serviceFee": valuecharge,
                "prosentaseAdminFee": valuemradmin + " %",
                "price": databuy[0].saleAmount,
                "totalAmount": totalamount,
                "monetize": databuy[0].monetize

            };
        } else {
            throw new BadRequestException("Content not for sell..!");
        }



        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/searchdata')
    @UseGuards(JwtAuthGuard)
    async contentfilter(@Req() request: Request): Promise<any> {
        var datavids = null;
        var datadiary = null;
        var datapict = null;
        var keys = null;
        var datatag = null;
        var datauser = null;
        var postType = null;
        var skip = 0;
        var limit = 0;
        var totalFilterPostVid = null;
        var totalFilterVid = null;
        var totalFilterPostDiary = null;
        var totalFilterDiary = null;
        var totalFilterPostPic = null;
        var totalFilterPict = null;
        var totalFilterPostUser = null;
        var totalFilterUser = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
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

        if (request_json["keys"] !== undefined) {
            keys = request_json["keys"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };





        try {
            datauser = await this.getuserprofilesService.findUser(keys, skip, limit);
        } catch (e) {
            datauser = null;
        }

        try {
            datavids = await this.getusercontentsService.findcontentfilter(keys, "vid", skip, limit);
        } catch (e) {
            datavids = null;
        }

        try {
            datadiary = await this.getusercontentsService.findcontentfilter(keys, "diary", skip, limit);
        } catch (e) {
            datadiary = null;
        }

        try {
            datapict = await this.getusercontentsService.findcontentfilter(keys, "pict", skip, limit);
        } catch (e) {
            datapict = null;
        }

        var totalFilterPostTag = null;
        var totalFilter = null;
        if (keys !== "") {
            try {
                datatag = await this.getusercontentsService.findcontentfilterTags(keys, skip, limit);
            } catch (e) {
                datatag = null;
            }

            try {
                totalFilterPostTag = await this.getusercontentsService.findcountfilteTag(keys);
                totalFilter = totalFilterPostTag[0].totalpost;
            } catch (e) {
                totalFilter = 0;
            }

        } else {

            try {
                datatag = await this.getusercontentsService.findcontentAllTags(skip, limit);
            } catch (e) {
                datatag = null;
            }

            try {
                totalFilterPostTag = await this.getusercontentsService.findcountfilteTagAll();
                totalFilter = totalFilterPostTag[0].totalpost;
            } catch (e) {
                totalFilter = 0;
            }

        }

        try {
            totalFilterPostVid = await this.getusercontentsService.findcountfilterall(keys, "vid");
            totalFilterVid = totalFilterPostVid[0].totalpost;
        } catch (e) {
            totalFilterVid = 0;
        }

        try {
            totalFilterPostDiary = await this.getusercontentsService.findcountfilterall(keys, "diary");
            totalFilterDiary = totalFilterPostDiary[0].totalpost;
        } catch (e) {
            totalFilterDiary = 0;
        }

        try {
            totalFilterPostPic = await this.getusercontentsService.findcountfilterall(keys, "pict");
            totalFilterPict = totalFilterPostPic[0].totalpost;
        } catch (e) {
            totalFilterPict = 0;
        }

        try {
            totalFilterPostUser = await this.userauthsService.coutRow(keys);
            totalFilterUser = totalFilterPostUser[0].totalpost;
        } catch (e) {
            totalFilterUser = 0;
        }


        let data = {
            "users": { "data": datauser, "totalFilter": totalFilterUser, "skip": skip, "limit": limit },
            "tags": { "data": datatag, "totalFilter": totalFilter, "skip": skip, "limit": limit },
            "vid": { "data": datavids, "totalFilter": totalFilterVid, "skip": skip, "limit": limit },
            "diary": { "data": datadiary, "totalFilter": totalFilterDiary, "skip": skip, "limit": limit },
            "pict": { "data": datapict, "totalFilter": totalFilterPict, "skip": skip, "limit": limit },
        };
        return { response_code: 202, data, messages };
    }


    @Post('api/getusercontents/searchdatabyuser')
    @UseGuards(JwtAuthGuard)
    async contentfilterbyuser(@Req() request: Request): Promise<any> {
        var datavids = null;
        var datadiary = null;
        var datapict = null;
        var keys = null;
        var datatag = null;
        var datauser = null;
        var postType = null;
        var skip = 0;
        var limit = 0;
        var totalFilterPostVid = null;
        var totalFilterVid = null;
        var totalFilterPostDiary = null;
        var totalFilterDiary = null;
        var totalFilterPostPic = null;
        var totalFilterPict = null;
        var totalFilterPostUser = null;
        var totalFilterUser = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
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

        if (request_json["keys"] !== undefined) {
            keys = request_json["keys"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };




        try {
            datauser = await this.getuserprofilesService.findUserDetail(keys, skip, limit);

        } catch (e) {
            datauser = null;
        }

        try {
            datavids = await this.getusercontentsService.findcontentfilterbyuser(keys, "vid", skip, limit);
        } catch (e) {
            datavids = null;
        }

        try {
            datadiary = await this.getusercontentsService.findcontentfilterbyuser(keys, "diary", skip, limit);
        } catch (e) {
            datadiary = null;
        }

        try {
            datavids = await this.getusercontentsService.findcontentfilterbyuser(keys, "vid", skip, limit);
        } catch (e) {
            datapict = null;
        }


        try {
            totalFilterPostVid = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "vid");
            totalFilterVid = totalFilterPostVid.length;
        } catch (e) {
            totalFilterVid = 0;
        }

        try {
            totalFilterPostDiary = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "diary");
            totalFilterDiary = totalFilterPostDiary.length;
        } catch (e) {
            totalFilterDiary = 0;
        }

        try {
            totalFilterPostPic = await this.getusercontentsService.findcontentfilterbyuserCount(keys, "pict");
            totalFilterPict = totalFilterPostPic.length;
        } catch (e) {
            totalFilterPict = 0;
        }

        try {
            totalFilterPostUser = await this.getuserprofilesService.findUserDetailCount(keys);
            totalFilterUser = totalFilterPostUser.length;
        } catch (e) {
            totalFilterUser = 0;
        }


        let data = {
            "users": { "data": datauser, "totalFilter": totalFilterUser, "skip": skip, "limit": limit },
            "vid": { "data": datavids, "totalFilter": totalFilterVid, "skip": skip, "limit": limit },
            "diary": { "data": datadiary, "totalFilter": totalFilterDiary, "skip": skip, "limit": limit },
            "pict": { "data": datapict, "totalFilter": totalFilterPict, "skip": skip, "limit": limit },
        };
        return { response_code: 202, data, messages };
    }


    // async roundUp(num, precision) {
    //     precision = Math.pow(10, precision)
    //     return Math.ceil(num * precision) / precision
    // }




}
