import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards, Request, BadRequestException, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserAdsService } from './userads.service';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { AdsService } from '../ads/ads.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
@Controller()
export class UserAdsController {
    constructor(private readonly userAdsService: UserAdsService,
        private readonly adsService: AdsService, private readonly contenteventsService: ContenteventsService) { }

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
                        return res.status(HttpStatus.OK).json({
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
                        return res.status(HttpStatus.OK).json({
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
            return res.status(HttpStatus.BAD_REQUEST).json({

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
    @Post('api/userads/management/traffic')
    @UseGuards(JwtAuthGuard)
    async traffic(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var email;
        var startdate;
        var enddate;
        if (request_json["email"] !== undefined || request_json["startdate"] !== undefined || request_json["enddate"] !== undefined) {
            email = request_json["email"];
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        let adsIds = await this.adsService.findAdsIDsByEmail(email);
        // console.log(adsIds);
        let ads = await this.userAdsService.findByAdsIDsDate(adsIds, startdate, enddate);
        // console.log(ads);
        let data = await this.userAdsService.groupByDateActivity(ads);
        // console.log(data);

        return { response_code: 202, data, messages };
    }
    @Post('api/userads/management/demografi')
    @UseGuards(JwtAuthGuard)
    async demografi(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var email;
        var startdate;
        var enddate;
        if (request_json["email"] !== undefined || request_json["startdate"] !== undefined || request_json["enddate"] !== undefined) {
            email = request_json["email"];
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        let adsIds = await this.adsService.findAdsIDsByEmail(email);
        // console.log(adsIds);
        let ads = await this.userAdsService.findByAdsIDsDate(adsIds, startdate, enddate);
        console.log(ads);
        let byArea = await this.userAdsService.groupBy(ads, 'area');
        let byGender = await this.userAdsService.groupBy(ads, 'gender');
        let byAge = await this.userAdsService.groupBy(ads, 'age');
        var data = [{ 'byArea': byArea, 'byGender': byGender, 'byAge': byAge }];

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/userads/summaryprofile')
    async findsummary(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var startdate = null;
        var enddate = null;
        var dataprofile = null;
        var totalkunjungan = null;
        var detailkunjungan = null;
        var datadetailkunjungan = null;
        var datadetailview = null;
        var datadetailclick = null;
        var datauserads = null;
        var dataview = [];
        var arrdata = [];
        var objdata = {};
        var dataclick = null;
        var sumView = null;
        var sumClick = null;
        var totalView = null;
        var lengprofile = null;
        var lengviews = null;
        var lengclicks = null;
        var lengview = null;
        var lengclick = null;
        var email = null;
        var iduser = null;
        var arrdataview = [];
        var arrdataclick = [];
        var datacountads = null;
        var countads = 0;
        var arr = [];
        email = request_json["email"];
        iduser = request_json["iduser"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        var userid = mongoose.Types.ObjectId(iduser);

        // kunjungan profil

        var date1 = new Date(startdate);
        var date2 = new Date(enddate);

        //calculate time difference  
        var time_difference = date2.getTime() - date1.getTime();

        //calculate days difference by dividing total milliseconds in a day  
        var resultTime = time_difference / (1000 * 60 * 60 * 24);
        console.log(resultTime);

        try {
            dataprofile = await this.contenteventsService.findkunjunganprofile(email, startdate, enddate);
            totalkunjungan = dataprofile[0].total;
        } catch (e) {
            dataprofile = null;
            totalkunjungan = 0;
        }

        try {
            datadetailkunjungan = await this.contenteventsService.detailkunjunganprofile(email, startdate, enddate);
            lengprofile = datadetailkunjungan.length;
        } catch (e) {
            datadetailkunjungan = null;
            lengprofile = 0;

        }

        try {
            datadetailview = await this.userAdsService.detailView(userid, startdate, enddate);
            lengviews = datadetailview.length;
        } catch (e) {
            datadetailview = null;
            lengviews = 0;

        }

        try {
            datadetailclick = await this.userAdsService.detailClick(userid, startdate, enddate);
            lengclicks = datadetailclick.length;
        } catch (e) {
            datadetailclick = null;
            lengclicks = 0;

        }

        try {
            datacountads = await this.adsService.countadsuser(userid);
            countads = datacountads[0].totalpost;
        } catch (e) {
            datacountads = [];
            countads = 0;

        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < lengprofile; j++) {
                    if (datadetailkunjungan[j].date == stdt) {
                        count = datadetailkunjungan[j].total;
                        break;
                    }
                }
                arrdata.push({
                    'date': stdt,
                    'count': count
                });

            }

        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < lengviews; j++) {
                    if (datadetailview[j].date == stdt) {
                        count = datadetailview[j].total;
                        break;
                    }
                }
                arrdataview.push({
                    'date': stdt,
                    'count': count
                });

            }

        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var count = 0;
                for (var j = 0; j < lengclicks; j++) {
                    if (datadetailclick[j].date == stdt) {
                        count = datadetailclick[j].total;
                        break;
                    }
                }
                arrdataclick.push({
                    'date': stdt,
                    'count': count
                });

            }

        }


        if (lengviews > 0) {

            for (let i = 0; i < lengviews; i++) {
                sumView += datadetailview[i].total;

            }

        } else {
            sumView = 0;
        }



        if (lengclicks > 0) {

            for (let i = 0; i < lengclicks; i++) {
                sumClick += datadetailclick[i].total;

            }

        } else {
            sumClick = 0;
        }

        var data = {

            viewProfile: { totalkunjungan: totalkunjungan, detail: arrdata },
            view: { totalView: sumView, detail: arrdataview },
            click: { totalClick: sumClick, detail: arrdataclick },
            totalAds: countads
        }

        return { response_code: 202, data, messages };



    }

    @Post('api/userads/console/adscenter/demographchart')
    @UseGuards(JwtAuthGuard)
    async getdemographchart(@Req() request: Request): Promise<any> {
        var data = null;
        var startdate = null;
        var enddate = null;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        }
        else {
            throw new BadRequestException("Unabled to proceed");
        }

        var getdatabase = await this.userAdsService.getAdsbygender(startdate, enddate);
        // console.log(JSON.stringify(getdatabase));

        var getdata = [];
        try {
            getdata = getdatabase[0].gender;
        }
        catch (e) {
            getdata = [];
        }

        var arraygender = [];
        var checkgender = ["OTHER", "MALE", "FEMALE"];
        for (var i = 0; i < checkgender.length; i++) {
            let obj = getdata.find(objs => objs._id === checkgender[i]);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    _id: checkgender[i],
                    total: 0
                }
            }
            arraygender.push(obj);
        }

        var tempdata = getdatabase[0].area;
        tempdata.forEach(e => {
            e.persentase = e.persentase.toFixed(2);
        });

        data =
        {
            gender: arraygender,
            daerah: tempdata,
        }

        const messages = {
            "info": ["The process successful"],
        };

        return { response_code: 202, data, messages };
    }

    @Post('api/userads/console/adscenter/listpenonton')
    @UseGuards(JwtAuthGuard)
    async listriwayatpenonton(@Req() request: Request): Promise<any> {
        var data = null;
        var area = null;
        var startdate = null;
        var enddate = null;
        var minage = null;
        var maxage = null;
        var filterpriority = null;
        var findname = null;
        var gender = null;
        var iddata = null;
        var page = null;
        var limit = null;
        const messages = {
            "info": ["The process successful"],
        };
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            iddata = request_json["id"];
        }
        else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["startdate"] !== undefined && request_json["enddate"] !== undefined) {
            startdate = request_json["startdate"];
            enddate = request_json["enddate"];
        }
        if (request_json["minage"] !== undefined && request_json["maxage"] !== undefined) {
            minage = Number(request_json["minage"]);
            maxage = Number(request_json["maxage"]);
        }
        if (request_json["area"] !== undefined) {
            area = request_json["area"];
        }
        if (request_json["filterpriority"] !== undefined) {
            filterpriority = request_json["filterpriority"];
        }
        if (request_json["gender"] !== undefined) {
            gender = request_json["gender"];
        }
        if (request_json["findname"] !== undefined) {
            findname = request_json["findname"];
        }
        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        }
        if (request_json["limit"] !== undefined) {
            limit = Number(request_json["limit"]);
        }

        var getdata = null;
        var lengthdata = null;
        try {
            getdata = await this.userAdsService.listpenonton(iddata, startdate, enddate, minage, maxage, gender, area, filterpriority, findname, limit, page);
            lengthdata = getdata.length;
        }
        catch (e) {
            getdata = [];
            lengthdata = 0;
        }
        var temptotalsearch = null;
        var lengthsearch = 0;
        try {
            temptotalsearch = await this.userAdsService.listpenonton(iddata, startdate, enddate, minage, maxage, gender, area, filterpriority, findname, undefined, undefined);
            lengthsearch = temptotalsearch.length;
        }
        catch (e) {
            temptotalsearch = [];
            lengthsearch = 0;
        }
        var totalpage = 0;
        var gettotal = (lengthsearch / limit).toFixed(0);
        var sisa = (lengthsearch % limit);
        if (sisa > 0 && sisa < 5) {
            totalpage = parseInt(gettotal) + 1;
        }
        else {
            totalpage = parseInt(gettotal);
        }
        return { response_code: 202, data: getdata, totalsearch: lengthsearch, totalpage: totalpage, totaldatainpage: lengthdata, limit: limit, page: page, messages };
    }
}
