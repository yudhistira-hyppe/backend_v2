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
import { PostsService } from '../../content/posts/posts.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { PostContentService } from '../../content/posts/postcontent.service';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly getcontenteventsService: GetcontenteventsService,
        private readonly settingsService: SettingsService,
        private readonly countriesService: CountriesService,
        private readonly getuserprofilesService: GetuserprofilesService,
        private readonly userauthsService: UserauthsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
        private readonly mediaprofilepictsService: MediaprofilepictsService,
    ) { }

    @Post('api/getusercontents/all')
    @UseGuards(JwtAuthGuard)
    async contentuserall(@Req() request: Request): Promise<any> {

        var email = null;
        var page = 0;
        var limit = 0;
        var monetize = null;
        var startdate = null;
        var enddate = null;
        var popular = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
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
        monetize = request_json["monetize"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        popular = request_json["popular"];
        const messages = {
            "info": ["The process successful"],
        };



        var total = null;
        var totalsearch = null;
        var totalallrow = null;
        var totalpage = null;
        let data = await this.getusercontentsService.findalldata(email, monetize, popular, startdate, enddate, page, limit);

        total = data.length;
        let datasearch = await this.getusercontentsService.findalldata(email, monetize, popular, startdate, enddate, 0, 0);
        totalsearch = datasearch.length;

        let dataall = await this.getusercontentsService.findalldata(email, undefined, undefined, undefined, undefined, 0, 0);
        totalallrow = dataall.length;

        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }
        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
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
        var dataowner = await this.getusercontentsService.findmanagementcontentowner(email);
        var latestownership = dataowner[0];

        // var datacountri = await this.countriesService.findAll();
        // var lengcountri = datacountri.length;
        // var dataregionall = await this.getusercontentsService.findmanagementcontentallregion(email);
        // var totalpost = dataregionall.length;
        // var datapost = [];
        // for (var i = 0; i < lengcountri; i++) {
        //     var countri = datacountri[i].country;
        //     dataregion = await this.getusercontentsService.findmanagementcontentregion(email, countri);
        //     var recentlyregion = dataregion;
        //     var lengregion = dataregion.length;
        //     var obj = {};
        //     for (var x = 0; x < lengregion; x++) {
        //         var tepost = dataregion[x].totalpost * 100 / totalpost;
        //         var tpost = tepost.toFixed(2);
        //         obj = { "_id": countri, "totalpost": tepost };
        //         datapost.push(obj);
        //     }
        // }
        // var datatraffic = await this.getusercontentsService.findmanagementcontenttrafic(email);
        // var traffic = datatraffic[0];

        var postIDs = await this.getusercontentsService.findPostIDsByEmail(email);
        var events = await this.getcontenteventsService.findByPostID(postIDs, ['VIEW']);
        var byGenders = await this.getcontenteventsService.groupEventsBy(events, 'genderp');
        var byYms = await this.getcontenteventsService.groupEventsBy(events, 'ym');
        var datamoderate = await this.getusercontentsService.findmanagementcontentmoderate(email);
        var moderate = datamoderate[0];

        data = [{
            "popular": popular, "mostlikes": mostlikes, "mostshares": mostshares, "latestpost": latestpost, "latestmonetize": latestmonetize, "latestownership": latestownership,
            "moderate": moderate, "byGenders": byGenders, "byYms": byYms
        }];
        // console.log(data);
        // console.log('returning data');
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
        var reported = request_json["reported"];


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
        let dataFilter = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, 0, totalAll);
        let data = await this.getusercontentsService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, skip, limit);
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

            datavacharge = await this.settingsService.findOne(idvacharege);
            valuecharge = datavacharge._doc.value;

        } catch (e) {
            valuecharge = 0;
        }
        try {

            datamradmin = await this.settingsService.findOne(idmdradmin);
            var valuemradmin = datamradmin._doc.value;
            var nominalmradmin = saleAmount * valuemradmin / 100;

            totalamount = saleAmount + Math.ceil(nominalmradmin) + valuecharge;



        } catch (e) {
            totalamount = saleAmount + 0;
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
                "certified": databuy[0].certified,
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

    // @Post('api/getusercontents/searchdata')
    // @UseGuards(JwtAuthGuard)
    // async contentfilter(@Req() request: Request): Promise<any> {

    //     var datavids = null;
    //     var isLike = null;
    //     var datadiary = null;
    //     var datapict = null;
    //     var keys = null;
    //     var datatag = null;
    //     var datauser = null;
    //     var postType = null;
    //     var mediaprofilepicts = null;
    //     var skip = 0;
    //     var limit = 0;
    //     var totalFilterPostVid = null;
    //     var totalFilterVid = null;
    //     var totalFilterPostDiary = null;
    //     var totalFilterDiary = null;
    //     var totalFilterPostPic = null;
    //     var totalFilterPict = null;
    //     var totalFilterPostUser = null;
    //     var totalFilterUser = null;
    //     var email = null;
    //     var dataLike = null;

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["skip"] !== undefined) {
    //         skip = request_json["skip"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     if (request_json["limit"] !== undefined) {
    //         limit = request_json["limit"];
    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }

    //     email = request_json["email"];
    //     keys = request_json["keys"];


    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     var arrmediaid = [];
    //     var arrdatauser = [];
    //     var objuser = {};
    //     var mediaprofilepicts_res = {};


    //     if (keys !== undefined) {



    //         try {

    //             datauser = await this.userauthsService.findUserNew(keys, skip, limit);

    //             for (var i = 0; i < datauser.length; i++) {
    //                 var media = datauser[i].mediaId;

    //                 try {

    //                     mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
    //                     console.log(mediaprofilepicts)
    //                     var mediaUri = mediaprofilepicts.mediaUri;
    //                     let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
    //                     mediaprofilepicts_res = {
    //                         mediaBasePath: mediaprofilepicts.mediaBasePath,
    //                         mediaUri: mediaprofilepicts.mediaUri,
    //                         mediaType: mediaprofilepicts.mediaType,
    //                         mediaEndpoint: result
    //                     };
    //                 } catch (e) {

    //                     mediaprofilepicts_res = {
    //                         mediaBasePath: "",
    //                         mediaUri: "",
    //                         mediaType: "",
    //                         mediaEndpoint: ""
    //                     };
    //                 }


    //                 objuser = {

    //                     "_id": datauser[i]._id,
    //                     "avatar": mediaprofilepicts_res,
    //                     "idUserAuth": datauser[i].idUserAuth,
    //                     "username": datauser[i].username,
    //                     "fullName": datauser[i].fullName,
    //                     "email": datauser[i].email,
    //                 }

    //                 arrdatauser.push(objuser);
    //             }

    //         } catch (e) {
    //             datauser = null;
    //             arrdatauser = [];

    //         }

    //     } else {
    //         arrdatauser = [];
    //     }


    //     try {
    //         let query = null;
    //         query = await this.postsService.findcontentfilters(keys, "vid", skip, limit, email);

    //         var datas = null;
    //         var arrdata = [];
    //         let pict: String[] = [];
    //         var objk = {};
    //         var type = null;
    //         var idapsara = null;
    //         var apsara = null;
    //         var idapsaradefine = null;
    //         var apsaradefine = null;
    //         for (var i = 0; i < query.length; i++) {
    //             try {
    //                 idapsara = query[i].apsaraId;
    //             } catch (e) {
    //                 idapsara = "";
    //             }
    //             try {
    //                 apsara = query[i].apsara;
    //             } catch (e) {
    //                 apsara = false;
    //             }
    //             if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
    //                 apsaradefine = false;
    //             } else {
    //                 apsaradefine = true;
    //             }

    //             if (idapsara === undefined || idapsara === "" || idapsara === null) {
    //                 idapsaradefine = "";
    //             } else {
    //                 idapsaradefine = idapsara;
    //             }
    //             var type = query[i].postType;
    //             pict = [idapsara];

    //             if (idapsara === "") {
    //                 datas = [];
    //             } else {
    //                 if (type === "pict") {

    //                     try {
    //                         datas = await this.postContentService.getImageApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "vid") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }

    //                 }
    //                 else if (type === "story") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "diary") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //             }

    //             let postid = query[i].postID;
    //             try {
    //                 dataLike = await this.postsService.isLike(email, postid);
    //             } catch (e) {
    //                 dataLike = null;

    //             }

    //             if (dataLike.length > 0) {
    //                 isLike = true
    //             } else {
    //                 isLike = false
    //             }
    //             objk = {
    //                 "_id": query[i]._id,
    //                 "mediaBasePath": query[i].mediaBasePath,
    //                 "mediaUri": query[i].mediaUri,
    //                 "mediaType": query[i].mediaType,
    //                 "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
    //                 "mediaEndpoint": query[i].mediaEndpoint,
    //                 "mediaThumbUri": query[i].mediaThumbUri,
    //                 "createdAt": query[i].createdAt,
    //                 "updatedAt": query[i].updatedAt,
    //                 "postID": query[i].postID,
    //                 "email": query[i].email,
    //                 "postType": query[i].postType,
    //                 "description": query[i].description,
    //                 "title": query[i].title,
    //                 "active": query[i].active,
    //                 "metadata": query[i].metadata,
    //                 "location": query[i].location,
    //                 "isOwned": query[i].isOwned,
    //                 "visibility": query[i].visibility,
    //                 "isViewed": query[i].isViewed,
    //                 "allowComments": query[i].allowComments,
    //                 "saleAmount": query[i].saleAmount,
    //                 "monetize": query[i].monetize,
    //                 "insight": query[i].insight,
    //                 "apsaraId": idapsaradefine,
    //                 "isApsara": apsaradefine,
    //                 "certified": query[i].certified,
    //                 "isLiked": isLike,
    //                 "reportedStatus": query[i].reportedStatus,
    //                 "reportedUserCount": query[i].reportedUserCount,
    //                 "media": datas
    //             };

    //             arrdata.push(objk);
    //         }
    //         datavids = arrdata;
    //     } catch (e) {
    //         datavids = null;
    //     }

    //     try {
    //         let query = null;
    //         query = await this.postsService.findcontentfilters(keys, "diary", skip, limit, email);
    //         var datas = null;
    //         var arrdata = [];
    //         let pict: String[] = [];
    //         var objk = {};
    //         var type = null;
    //         var idapsara = null;
    //         var apsara = null;
    //         var idapsaradefine = null;
    //         var apsaradefine = null;
    //         for (var i = 0; i < query.length; i++) {
    //             try {
    //                 idapsara = query[i].apsaraId;
    //             } catch (e) {
    //                 idapsara = "";
    //             }
    //             try {
    //                 apsara = query[i].apsara;
    //             } catch (e) {
    //                 apsara = false;
    //             }
    //             if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
    //                 apsaradefine = false;
    //             } else {
    //                 apsaradefine = true;
    //             }

    //             if (idapsara === undefined || idapsara === "" || idapsara === null) {
    //                 idapsaradefine = "";
    //             } else {
    //                 idapsaradefine = idapsara;
    //             }
    //             var type = query[i].postType;
    //             pict = [idapsara];

    //             if (idapsara === "") {
    //                 datas = [];
    //             } else {
    //                 if (type === "pict") {

    //                     try {
    //                         datas = await this.postContentService.getImageApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "vid") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }

    //                 }
    //                 else if (type === "story") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "diary") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //             }

    //             let postid = query[i].postID;
    //             try {
    //                 dataLike = await this.postsService.isLike(email, postid);
    //             } catch (e) {
    //                 dataLike = null;

    //             }

    //             if (dataLike.length > 0) {
    //                 isLike = true
    //             } else {
    //                 isLike = false
    //             }
    //             objk = {
    //                 "_id": query[i]._id,
    //                 "mediaBasePath": query[i].mediaBasePath,
    //                 "mediaUri": query[i].mediaUri,
    //                 "mediaType": query[i].mediaType,
    //                 "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
    //                 "mediaEndpoint": query[i].mediaEndpoint,
    //                 "mediaThumbUri": query[i].mediaThumbUri,
    //                 "createdAt": query[i].createdAt,
    //                 "updatedAt": query[i].updatedAt,
    //                 "postID": query[i].postID,
    //                 "email": query[i].email,
    //                 "postType": query[i].postType,
    //                 "description": query[i].description,
    //                 "title": query[i].title,
    //                 "active": query[i].active,
    //                 "metadata": query[i].metadata,
    //                 "location": query[i].location,
    //                 "isOwned": query[i].isOwned,
    //                 "visibility": query[i].visibility,
    //                 "isViewed": query[i].isViewed,
    //                 "allowComments": query[i].allowComments,
    //                 "saleAmount": query[i].saleAmount,
    //                 "monetize": query[i].monetize,
    //                 "insight": query[i].insight,
    //                 "apsaraId": idapsaradefine,
    //                 "isApsara": apsaradefine,
    //                 "certified": query[i].certified,
    //                 "isLiked": isLike,
    //                 "reportedStatus": query[i].reportedStatus,
    //                 "reportedUserCount": query[i].reportedUserCount,
    //                 "media": datas
    //             };

    //             arrdata.push(objk);
    //         }
    //         datadiary = arrdata;
    //     } catch (e) {
    //         datadiary = null;
    //     }

    //     try {
    //         let query = null;
    //         query = await this.postsService.findcontentfilters(keys, "pict", skip, limit, email);

    //         var datas = null;
    //         var arrdata = [];
    //         let pict: String[] = [];
    //         var objk = {};
    //         var type = null;
    //         var idapsara = null;
    //         var apsara = null;
    //         var idapsaradefine = null;
    //         var apsaradefine = null;
    //         for (var i = 0; i < query.length; i++) {
    //             try {
    //                 idapsara = query[i].apsaraId;
    //             } catch (e) {
    //                 idapsara = "";
    //             }
    //             try {
    //                 apsara = query[i].apsara;
    //             } catch (e) {
    //                 apsara = false;
    //             }
    //             if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
    //                 apsaradefine = false;
    //             } else {
    //                 apsaradefine = true;
    //             }

    //             if (idapsara === undefined || idapsara === "" || idapsara === null) {
    //                 idapsaradefine = "";
    //             } else {
    //                 idapsaradefine = idapsara;
    //             }
    //             var type = query[i].postType;
    //             pict = [idapsara];

    //             if (idapsara === "") {
    //                 datas = [];
    //             } else {
    //                 if (type === "pict") {

    //                     try {
    //                         datas = await this.postContentService.getImageApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "vid") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }

    //                 }
    //                 else if (type === "story") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //                 else if (type === "diary") {
    //                     try {
    //                         datas = await this.postContentService.getVideoApsara(pict);
    //                     } catch (e) {
    //                         datas = [];
    //                     }
    //                 }
    //             }


    //             let postid = query[i].postID;
    //             try {
    //                 dataLike = await this.postsService.isLike(email, postid);
    //             } catch (e) {
    //                 dataLike = null;

    //             }

    //             if (dataLike.length > 0) {
    //                 isLike = true
    //             } else {
    //                 isLike = false
    //             }

    //             objk = {
    //                 "_id": query[i]._id,
    //                 "mediaBasePath": query[i].mediaBasePath,
    //                 "mediaUri": query[i].mediaUri,
    //                 "mediaType": query[i].mediaType,
    //                 "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
    //                 "mediaEndpoint": query[i].mediaEndpoint,
    //                 "mediaThumbUri": query[i].mediaThumbUri,
    //                 "createdAt": query[i].createdAt,
    //                 "updatedAt": query[i].updatedAt,
    //                 "postID": query[i].postID,
    //                 "email": query[i].email,
    //                 "postType": query[i].postType,
    //                 "description": query[i].description,
    //                 "title": query[i].title,
    //                 "active": query[i].active,
    //                 "metadata": query[i].metadata,
    //                 "location": query[i].location,
    //                 "isOwned": query[i].isOwned,
    //                 "visibility": query[i].visibility,
    //                 "isViewed": query[i].isViewed,
    //                 "allowComments": query[i].allowComments,
    //                 "saleAmount": query[i].saleAmount,
    //                 "monetize": query[i].monetize,
    //                 "insight": query[i].insight,
    //                 "apsaraId": idapsaradefine,
    //                 "isApsara": apsaradefine,
    //                 "certified": query[i].certified,
    //                 "isLiked": isLike,
    //                 "reportedStatus": query[i].reportedStatus,
    //                 "reportedUserCount": query[i].reportedUserCount,
    //                 "media": datas
    //             };

    //             arrdata.push(objk);
    //         }
    //         datapict = arrdata;
    //     } catch (e) {
    //         datapict = null;
    //     }

    //     let data = {
    //         "users": { "data": arrdatauser, "skip": skip, "limit": limit },
    //         "vid": { "data": datavids, "skip": skip, "limit": limit },
    //         "diary": { "data": datadiary, "skip": skip, "limit": limit },
    //         "pict": { "data": datapict, "skip": skip, "limit": limit },
    //     };
    //     return { response_code: 202, data, messages };
    // }


    @Post('api/getusercontents/searchdata')
    @UseGuards(JwtAuthGuard)
    async contentsearch(@Req() request: Request): Promise<any> {


        var keys = null;
        var skip = 0;
        var limit = 0;

        var email = null;
        var data = null;
        var datasearch = null;
        var dataLike = null;
        var listpict = null;
        var listvid = null;
        var listdiary = null;
        var listuser = null;

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

        email = request_json["email"];
        keys = request_json["keys"];
        listpict = request_json["listpict"];
        listvid = request_json["listvid"];
        listdiary = request_json["listdiary"];
        listuser = request_json["listuser"];


        const messages = {
            "info": ["The process successful"],
        };

        var arrmediaid = [];
        var arrdatauser = [];
        var objuser = {};
        var mediaprofilepicts_res = {};
        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var objpict = {};
        var objvid = {};
        var objdiary = {};
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;

        try {
            datasearch = await this.postsService.finddatasearchconten(keys, email, skip, limit, listpict, listvid, listdiary, listuser);
            user = datasearch[0].user;

        } catch (e) {
            datasearch = null;
            user = [];

        }

        try {
            user = datasearch[0].user;
            lenguser = user.length;

        } catch (e) {
            user = [];
            lenguser = 0;

        }

        try {
            arrpict = datasearch[0].pict;
            lengpict = arrpict.length;

        } catch (e) {
            arrpict = [];
            lengpict = 0;

        }
        try {
            arrvid = datasearch[0].vid;
            lengvid = arrvid.length;

        } catch (e) {
            arrvid = [];
            lengvid = 0;

        }

        try {
            arrdiary = datasearch[0].diary;
            lengdiary = arrdiary.length;

        } catch (e) {
            arrdiary = [];
            lengdiary = 0;

        }

        if (lenguser > 0 && user[0].email !== undefined) {
            user = datasearch[0].user;
        } else {
            user = [];
        }

        if (lengpict > 0) {
            let idapsara = null;
            let datas = null;
            let apsara = null;
            let apsaradefine = null;
            let idapsaradefine = null;
            let pict = null;

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {

                    try {
                        idapsara = arrpict[i].apsaraId;
                    } catch (e) {
                        idapsara = "";
                    }
                    try {
                        apsara = arrpict[i].isApsara;
                    } catch (e) {
                        apsara = false;
                    }
                    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                        apsaradefine = false;
                    } else {
                        apsaradefine = true;
                    }

                    if (idapsara === undefined || idapsara === "" || idapsara === null) {
                        idapsaradefine = "";
                    } else {
                        idapsaradefine = idapsara;
                    }
                    var type = arrpict[i].postType;
                    pict = [idapsara];
                    if (idapsara === "") {
                        datas = [];
                    } else {
                        if (type === "pict") {

                            try {
                                datas = await this.postContentService.getImageApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "vid") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }

                        }
                        else if (type === "story") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "diary") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                    }




                    objpict = {
                        "_id": arrpict[i]._id,
                        "createdAt": arrpict[i].createdAt,
                        "updatedAt": arrpict[i].updatedAt,
                        "postID": arrpict[i].postID,
                        "email": arrpict[i].email,
                        "postType": arrpict[i].postType,
                        "description": arrpict[i].description,
                        "active": arrpict[i].active,
                        "metadata": arrpict[i].metadata,
                        "location": arrpict[i].location,
                        "isOwned": arrpict[i].isOwned,
                        "visibility": arrpict[i].visibility,
                        "allowComments": arrpict[i].allowComments,
                        "insight": arrpict[i].insight,
                        "saleAmount": arrpict[i].saleAmount,
                        "mediaThumbEndpoint": arrpict[i].mediaThumbEndpoint,
                        "mediaEndpoint": arrpict[i].mediaEndpoint,
                        "isLiked": arrpict[i].isLiked,
                        "certified": arrpict[i].certified,
                        "boosted": arrpict[i].boosted,
                        "reportedStatus": arrpict[i].reportedStatus,
                        "apsara": apsaradefine,
                        "apsaraId": idapsaradefine,
                        "media": datas

                    }

                    picts.push(objpict)

                }

            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        if (lengvid > 0) {
            let idapsara = null;
            let datas = null;
            let apsara = null;
            let apsaradefine = null;
            let idapsaradefine = null;
            let pict = null;

            if (arrvid[0]._id !== undefined) {
                for (let i = 0; i < lengvid; i++) {

                    try {
                        idapsara = arrvid[i].apsaraId;
                    } catch (e) {
                        idapsara = "";
                    }
                    try {
                        apsara = arrvid[i].isApsara;
                    } catch (e) {
                        apsara = false;
                    }
                    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                        apsaradefine = false;
                    } else {
                        apsaradefine = true;
                    }

                    if (idapsara === undefined || idapsara === "" || idapsara === null) {
                        idapsaradefine = "";
                    } else {
                        idapsaradefine = idapsara;
                    }
                    var type = arrvid[i].postType;
                    pict = [idapsara];
                    if (idapsara === "") {
                        datas = [];
                    } else {
                        if (type === "pict") {

                            try {
                                datas = await this.postContentService.getImageApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "vid") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }

                        }
                        else if (type === "story") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "diary") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                    }




                    objvid = {
                        "_id": arrvid[i]._id,
                        "createdAt": arrvid[i].createdAt,
                        "updatedAt": arrvid[i].updatedAt,
                        "postID": arrvid[i].postID,
                        "email": arrvid[i].email,
                        "postType": arrvid[i].postType,
                        "description": arrvid[i].description,
                        "active": arrvid[i].active,
                        "metadata": arrvid[i].metadata,
                        "location": arrvid[i].location,
                        "isOwned": arrvid[i].isOwned,
                        "visibility": arrvid[i].visibility,
                        "allowComments": arrvid[i].allowComments,
                        "insight": arrvid[i].insight,
                        "saleAmount": arrvid[i].saleAmount,
                        "mediaThumbEndpoint": arrvid[i].mediaThumbEndpoint,
                        "mediaEndpoint": arrvid[i].mediaEndpoint,
                        "isLiked": arrvid[i].isLiked,
                        "certified": arrvid[i].certified,
                        "reportedStatus": arrvid[i].reportedStatus,
                        "boosted": arrvid[i].boosted,
                        "apsara": apsaradefine,
                        "apsaraId": idapsaradefine,
                        "media": datas

                    }

                    vid.push(objvid)

                }
            } else {
                vid = [];
            }

        } else {
            vid = [];
        }

        if (lengdiary > 0) {
            let idapsara = null;
            let datas = null;
            let apsara = null;
            let apsaradefine = null;
            let idapsaradefine = null;
            let pict = null;

            if (arrdiary[0]._id !== undefined) {
                for (let i = 0; i < lengdiary; i++) {

                    try {
                        idapsara = arrdiary[i].apsaraId;
                    } catch (e) {
                        idapsara = "";
                    }
                    try {
                        apsara = arrdiary[i].isApsara;
                    } catch (e) {
                        apsara = false;
                    }
                    if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                        apsaradefine = false;
                    } else {
                        apsaradefine = true;
                    }

                    if (idapsara === undefined || idapsara === "" || idapsara === null) {
                        idapsaradefine = "";
                    } else {
                        idapsaradefine = idapsara;
                    }
                    var type = arrdiary[i].postType;
                    pict = [idapsara];
                    if (idapsara === "") {
                        datas = [];
                    } else {
                        if (type === "pict") {

                            try {
                                datas = await this.postContentService.getImageApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "vid") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }

                        }
                        else if (type === "story") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                        else if (type === "diary") {
                            try {
                                datas = await this.postContentService.getVideoApsara(pict);
                            } catch (e) {
                                datas = [];
                            }
                        }
                    }




                    objdiary = {
                        "_id": arrdiary[i]._id,
                        "createdAt": arrdiary[i].createdAt,
                        "updatedAt": arrdiary[i].updatedAt,
                        "postID": arrdiary[i].postID,
                        "email": arrdiary[i].email,
                        "postType": arrdiary[i].postType,
                        "description": arrdiary[i].description,
                        "active": arrdiary[i].active,
                        "metadata": arrdiary[i].metadata,
                        "location": arrdiary[i].location,
                        "isOwned": arrdiary[i].isOwned,
                        "visibility": arrdiary[i].visibility,
                        "allowComments": arrdiary[i].allowComments,
                        "insight": arrdiary[i].insight,
                        "saleAmount": arrdiary[i].saleAmount,
                        "mediaThumbEndpoint": arrdiary[i].mediaThumbEndpoint,
                        "mediaEndpoint": arrdiary[i].mediaEndpoint,
                        "isLiked": arrdiary[i].isLiked,
                        "certified": arrdiary[i].certified,
                        "reportedStatus": arrdiary[i].reportedStatus,
                        "boosted": arrdiary[i].boosted,
                        "apsara": apsaradefine,
                        "apsaraId": idapsaradefine,
                        "media": datas

                    }

                    diary.push(objdiary)

                }
            }
            else {
                diary = [];
            }
        } else {
            diary = [];
        }

        data = [{

            user, picts, vid, diary
        }];


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

    @UseGuards(JwtAuthGuard)
    @Post('api/getusercontents/database')
    async finddata(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var totalpage = null;
        var totalallrow = null;
        var totalsearch = null;
        var total = null;
        var username = null;
        var kepemilikan = [];
        var statusjual = [];
        var data = [];
        var description = null;
        var postType = [];
        var kategori = [];
        var startmount = null;
        var endmount = null;
        var descending = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        username = request_json["username"];
        description = request_json["description"];
        kepemilikan = request_json["kepemilikan"];
        statusjual = request_json["statusjual"];
        postType = request_json["postType"];
        kategori = request_json["kategori"];
        startmount = request_json["startmount"];
        endmount = request_json["endmount"];
        descending = request_json["descending"];
        var query = null;
        var datasearch = null;
        var dataall = null;
        try {
            query = await this.getusercontentsService.databasenew(username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending, page, limit);
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }


        try {
            total = query.length;
        } catch (e) {
            total = 0;
        }

        try {
            datasearch = await this.getusercontentsService.databasenewcount(username, description, kepemilikan, statusjual, postType, kategori, startdate, enddate, startmount, endmount, descending);
            totalsearch = datasearch[0].totalpost;
        } catch (e) {
            totalsearch = 0;
        }


        try {

            dataall = await this.getusercontentsService.findcountall();
            totalallrow = dataall[0].totalpost;

        } catch (e) {
            totalallrow = 0;
        }

        var tpage = null;
        var tpage2 = null;

        tpage2 = (totalsearch / limit).toFixed(0);
        tpage = (totalsearch % limit);
        if (tpage > 0 && tpage < 5) {
            totalpage = parseInt(tpage2) + 1;

        } else {
            totalpage = parseInt(tpage2);
        }

        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    @Post('api/getusercontents/database/details')
    @UseGuards(JwtAuthGuard)
    async detailcontent(@Req() request: Request): Promise<any> {

        var postID = null;
        var page = null;
        var limit = null;
        var datadetail = null;
        var lengdetail = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        page = request_json["page"];
        limit = request_json["limit"];

        const messages = {
            "info": ["The process successful"],
        };

        try {
            datadetail = await this.getusercontentsService.detailcontent(postID, page, limit);
            lengdetail = datadetail.length;
        } catch (e) {
            datadetail = null;
            lengdetail = 0;
        }
        if (lengdetail > 0) {


            var dataquery = null;
            dataquery = datadetail;
            var datanew = null;
            var data = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var dataage = null;
            var lengage = null;
            var sumage = null;
            var objcoun = {};
            var dataSum = [];

            var datagender = null;
            var lenggender = null;
            var sumgender = null;
            var objcoungender = {};
            var dataSumgender = [];

            var datawilayah = null;
            var lengwilayah = null;
            var sumwilayah = null;
            var objcounwilayah = {};
            var dataSumwilayah = [];
            var createdate = datadetail[0].createdAt;

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
            try {
                dataage = datadetail[0].age;
                lengage = dataage.length;
            } catch (e) {
                lengage = 0;
            }
            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    sumage += dataage[i].count;

                }

            } else {
                sumage = 0;
            }

            if (lengage > 0) {

                for (let i = 0; i < lengage; i++) {
                    let count = dataage[i].count;


                    let persen = count * 100 / sumage;
                    objcoun = {

                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSum.push(objcoun);
                }

            } else {
                dataSum = [];
            }

            try {
                datagender = datadetail[0].gender;
                lenggender = datagender.length;
            } catch (e) {
                lenggender = 0;
            }
            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    sumgender += datagender[i].count;

                }

            } else {
                sumgender = 0;
            }

            if (lenggender > 0) {

                for (let i = 0; i < lenggender; i++) {
                    let count = datagender[i].count;


                    let persen = count * 100 / sumgender;
                    objcoungender = {

                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumgender.push(objcoungender);
                }

            } else {
                dataSumgender = [];
            }

            try {
                datawilayah = datadetail[0].wilayah;
                lengwilayah = datawilayah.length;
            } catch (e) {
                lengwilayah = 0;
            }
            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    sumwilayah += datawilayah[i].count;

                }

            } else {
                sumwilayah = 0;
            }

            if (lengwilayah > 0) {

                for (let i = 0; i < lengwilayah; i++) {
                    let count = datawilayah[i].count;


                    let persen = count * 100 / sumwilayah;
                    objcounwilayah = {

                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumwilayah.push(objcounwilayah);
                }

            } else {
                dataSumwilayah = [];
            }
            for (var i = 0; i < dataquery.length; i++) {
                try {
                    idapsara = dataquery[i].apsaraId;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = dataquery[i].apsara;
                } catch (e) {
                    apsara = false;
                }

                if (apsara === undefined || apsara === "" || apsara === null || apsara === false) {
                    apsaradefine = false;
                } else {
                    apsaradefine = true;
                }

                if (idapsara === undefined || idapsara === "" || idapsara === null || idapsara === "other") {
                    idapsaradefine = "";
                } else {
                    idapsaradefine = idapsara;
                }
                var type = dataquery[i].postType;
                pict = [idapsara];

                if (idapsara === "") {

                } else {
                    if (type === "pict") {

                        try {
                            datanew = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            datanew = {};
                        }
                    }
                    else if (type === "vid") {
                        try {
                            datanew = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            datanew = {};
                        }

                    }
                    else if (type === "story") {
                        try {
                            datanew = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            datanew = {};
                        }
                    }
                    else if (type === "diary") {
                        try {
                            datanew = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            datanew = {};
                        }
                    }
                }
                objk = {

                    "_id": datadetail[0]._id,
                    "postID": datadetail[0].postID,
                    "email": datadetail[0].email,
                    "postType": datadetail[0].postType,
                    "description": datadetail[0].description,
                    "active": datadetail[0].active,
                    "createdAt": datadetail[0].createdAt,
                    "updatedAt": datadetail[0].updatedAt,
                    "visibility": datadetail[0].visibility,
                    "location": datadetail[0].location,
                    "tags": datadetail[0].tags,
                    "allowComments": datadetail[0].allowComments,
                    "likes": datadetail[0].likes,
                    "views": datadetail[0].views,
                    "shares": datadetail[0].shares,
                    "tagPeople": datadetail[0].tagPeople,
                    "tagDescription": datadetail[0].tagDescription,
                    "musicId": datadetail[0].musicId,
                    "kategori": datadetail[0].kategori,
                    "username": datadetail[0].username,
                    "saleAmount": datadetail[0].saleAmount,
                    "saleView": datadetail[0].saleView,
                    "saleLike": datadetail[0].saleLike,
                    "musicTitle": datadetail[0].musicTitle,
                    "albumName": datadetail[0].albumName,
                    "type": datadetail[0].type,
                    "kepemilikan": datadetail[0].kepemilikan,
                    "statusJual": datadetail[0].statusJual,
                    "mediaType": datadetail[0].mediaType,
                    "mediaThumbEndpoint": datadetail[0].mediaThumbEndpoint,
                    "mediaEndpoint": datadetail[0].mediaEndpoint,
                    "originalName": datadetail[0].originalName,
                    "age": dataSum,
                    "gender": dataSumgender,
                    "wilayah": dataSumwilayah,
                    "riwayat": datadetail[0].riwayat,
                    "comment": datadetail[0].comment,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "total": days + ":" + hours + ":" + minutes + ":" + seconds,
                    "media": datanew
                };

                data.push(objk);
            }

            return { response_code: 202, data, messages };
        }

        else {
            throw new BadRequestException("Data is not found..!");
        }

    }
}



