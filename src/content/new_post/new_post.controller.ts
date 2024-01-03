import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Post, Body, Headers, BadRequestException, Param, Query, UseInterceptors } from '@nestjs/common';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreatePostRequest, CreatePostResponse } from './dto/create-newPost.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { MediastikerService } from '../mediastiker/mediastiker.service';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { NewPostContentService } from './new_postcontent.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { SettingsService } from 'src/trans/settings/settings.service';
import { UtilsService } from 'src/utils/utils.service';
import { PostContentService } from '../posts/postcontent.service';
import { Request } from 'express';
@Controller('api/')
export class NewPostController {
    constructor(
        private readonly newPostContentService: PostContentService,
        private readonly newPostService: NewPostService,
        private readonly mediastikerService: MediastikerService,
        private readonly contenteventsService: ContenteventsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly logapiSS: LogapisService,
        private readonly settingsService: SettingsService,
        private readonly utilsService: UtilsService,
    ) { }

    // @UseGuards(JwtAuthGuard)
    // @Post('api/posts/createpost')
    // @UseInterceptors(FileInterceptor('postContent'))
    // async createPostV4new(@UploadedFile() file: Express.Multer.File, @Body() CreatePostRequest_: CreatePostRequest, @Headers() headers): Promise<CreatePostResponse> {
    //     console.log('============================================== CREATE POST HEADERS ==============================================', JSON.stringify(headers));
    //     console.log('============================================== CREATE POST BODY ==============================================', JSON.stringify(CreatePostRequest_));
    //     if (CreatePostRequest_.stiker !== undefined && CreatePostRequest_.image !== undefined && CreatePostRequest_.type !== undefined && CreatePostRequest_.position !== undefined) {

    //         var arrayStiker = [];
    //         var stiker = CreatePostRequest_.stiker;

    //         var splitstiker = stiker.toString();
    //         var splitreq2stiker = splitstiker.split(',');

    //         var image = CreatePostRequest_.image;
    //         var splitimage = image.toString();
    //         var splitreq2image = splitimage.split(',');

    //         var type = CreatePostRequest_.type;
    //         var splittype = type.toString();
    //         var splitreq2type = splittype.split(',');

    //         var position = CreatePostRequest_.position;
    //         var splitposition = position.toString();
    //         var splitreq2position = splitposition.split('#');

    //         if (splitreq2stiker.length !== splitreq2image.length && splitreq2stiker.length !== splitreq2type.length && splitreq2stiker.length !== splitreq2position.length) {
    //             throw new BadRequestException("Unabled to proceed,the length of data must be the same");
    //         } else {
    //             for (var i = 0; i < splitreq2stiker.length; i++) {
    //                 let id = splitreq2stiker[i];
    //                 let image = splitreq2image[i];
    //                 let type = splitreq2type[i];
    //                 let position = splitreq2position[i];
    //                 var ids = new mongoose.Types.ObjectId(id);
    //                 let arrayPosition = [];
    //                 let splitpos = position.split(',');
    //                 for (let x = 0; x < splitpos.length; x++) {
    //                     var num = parseFloat(splitpos[x]);
    //                     arrayPosition.push(num);
    //                 }

    //                 var obj = {
    //                     "_id": ids,
    //                     "image": image,
    //                     "position": arrayPosition,
    //                     "type": type
    //                 };
    //                 arrayStiker.push(obj);
    //             }
    //             CreatePostRequest_.stiker = arrayStiker;
    //         }
    //     }

    //     if (CreatePostRequest_.text !== undefined) {

    //         var arraytext = [];
    //         var text = CreatePostRequest_.text;

    //         var splitreqtext = text.toString();
    //         var splitreq2text = splitreqtext.split(',');

    //         for (var i = 0; i < splitreq2text.length; i++) {
    //             let idtext = splitreq2text[i];
    //             arraytext.push(idtext);
    //         }
    //         CreatePostRequest_.text = arraytext;
    //     }
    //     var data = await this.newPostContentService.createNewPostV5(file, CreatePostRequest_, headers);

    //     if (data !== undefined && data !== null) {
    //         console.log(arrayStiker)

    //         if (arrayStiker !== undefined && arrayStiker.length > 0) {
    //             this.updateused(arrayStiker);
    //         }

    //         var postID = data.data.postID;

    //         var email = data.data.email;

    //         const databasic = await this.userbasicnewService.findOne(
    //             email
    //         );
    //         var iduser = null;
    //         if (databasic !== null) {
    //             iduser = databasic._id;
    //             //this.userChallengePost(iduser.toString(), postID.toString(), "posts", "POST", postID);
    //             await this.contenteventsService.scorepostrequest(iduser.toString(), postID.toString(), "posts", "POST", postID);
    //         }
    //     }

    //     return data;
    // }

    async updateused(list: any[]) {
        return await this.mediastikerService.updatedata(list, "used");
    }

    @UseGuards(JwtAuthGuard)
    @Post('posts/getuserposts/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    async getUserPost(@Body() body, @Headers() headers): Promise<any> {
        var fullurl = headers.host + "/api/posts/getuserposts/v2";
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timestamps_start = splitdate[0];

        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log(auth);
        var profile = await this.basic2SS.findbyemail(auth.email);
        if (profile == null) {

            var dt = new Date(Date.now());
            dt.setHours(dt.getHours() + 7); // timestamp
            dt = new Date(dt);
            var strdate = dt.toISOString();
            var repdate = strdate.replace('T', ' ');
            var splitdate = repdate.split('.');
            var timestamps_end = splitdate[0];

            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, body.body);

            return {
                response_code: 204,
                message: {
                    "info": [
                        "User tidak terdaftar"
                    ]
                }
            }
        }

        // var data = await this.UserbasicnewService.getpostquery(email:string, visibility:string, postids: string, tipepost:string, activestatus:string, exptime:string, skip:number, page:number, insight:string, sorttime:string);
        var data = await this.basic2SS.getpostquery(auth.email, body.visibility, body.postID, body.postType, body.withActive, body.withExp, parseInt(body.pageRow), parseInt(body.pageNumber), body.withInsight, 'true');

        var listdata = [];
        var listmusic = [];
        var tempresult = null;
        var tempdata = null;
        for (var i = 0; i < data.length; i++) {
            tempdata = data[i];
            if (tempdata.isApsara == true) {
                listdata.push(tempdata.apsaraId);
            }
            else {
                listdata.push(undefined);
            }

            var getmusicapsara = null;
            try {
                getmusicapsara = tempdata.music.apsaraThumnail;
            }
            catch (e) {
                getmusicapsara = undefined;
            }
            listmusic.push(getmusicapsara);
        }

        //console.log(listdata);
        var apsaraimagedata = await this.newPostContentService.getImageApsara(listdata);
        // console.log(apsaraimagedata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaraimagedata.ImageInfo;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].ImageId == data[i].apsaraId) {
                    data[i].apsaraThumbId = tempresult[j].apsaraThumbId;
                }
            }
            // if (resultquery[i].apsara == false && (resultquery[i].mediaType == "image" || resultquery[i].mediaType == "images")) {
            //     resultquery[i].apsaraThumbId = '/thumb/' + resultquery[i].postID;
            // }
        }

        var apsaravideodata = await this.newPostContentService.getVideoApsara(listdata);
        // console.log(apsaravideodata);
        // console.log(resultdata.ImageInfo[0]);
        tempresult = apsaravideodata.VideoList;
        for (var i = 0; i < data.length; i++) {
            for (var j = 0; j < tempresult.length; j++) {
                if (tempresult[j].VideoId == data[i].apsaraId) {
                    data[i].mediaThumbEndpoint = tempresult[j].CoverURL;
                }
            }
            // if (resultquery[i].apsara == false && resultquery[i].mediaType == "video") {
            //     resultquery[i].mediaThumbEndpoint = '/thumb/' + resultquery[i].postID;
            // }
        }

        // console.log(listmusic);
        // var apsaramusic = await this.musicSS.getImageApsara(listmusic);
        // var setutil = require('util');
        // console.log(setutil.inspect(apsaramusic, { depth:null, showHidden:false }));
        // tempresult = apsaramusic.ImageInfo;
        // for (var i = 0; i < query.length; i++) {
        //     try
        //     {
        //         for (var j = 0; j < tempresult.length; j++) {
        //         if (tempresult[j].ImageId == query[i].music.apsaraThumnail) {
        //             query[i].music.apsaraThumnailUrl = tempresult[j].URL;
        //         }
        //         }
        //         if (query[i].apsara == false && query[i].mediaType == "video") {
        //         query[i].music.apsaraThumnailUrl = null;
        //         }
        //     }
        //     catch(e)
        //     {
        //         query[i].music.apsaraThumnailUrl = null;
        //     }
        // }

        // return this.postContentService.getUserPost(body, headers);
        var ver = await this.settingsService.findOneByJenis('AppsVersion');
        ver.value;
        var version = String(ver.value);

        return {
            response_code: 202,
            data: data,
            version: version
        }
    }

    @Post('api/posts/postbychart/v2')
    @UseGuards(JwtAuthGuard)
    async getPostChartBasedDate(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/posts/postbychart/v2";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        var data = null;
        var date = null;
        var iduser = null;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["date"] !== undefined) {
            date = request_json["date"];
        }
        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var tempdata = await this.newPostService.getPostByDate(date);
        var getdata = [];
        try {
            getdata = tempdata[0].resultdata;
        }
        catch (e) {
            getdata = [];
        }

        var startdate = new Date(date);
        startdate.setDate(startdate.getDate() - 1);
        var tempdate = new Date(startdate).toISOString().split("T")[0];
        var end = new Date().toISOString().split("T")[0];
        var array = [];

        //kalo lama, berarti error disini!!
        while (tempdate != end) {
            var temp = new Date(tempdate);
            temp.setDate(temp.getDate() + 1);
            tempdate = new Date(temp).toISOString().split("T")[0];
            //console.log(tempdate);

            let obj = getdata.find(objs => objs._id === tempdate);
            //console.log(obj);
            if (obj == undefined) {
                obj =
                {
                    _id: tempdate,
                    totaldata: 0
                }
            }

            array.push(obj);
        }

        data =
        {
            data: array,
            total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

        return { response_code: 202, messages, data };
    }

    @Get('api/posts/showsertifikasistatbychart/v2')
    @UseGuards(JwtAuthGuard)
    async getCertifiedStatByChart(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/posts/showsertifikasistatbychart/v2";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        var data = null;

        const messages = {
            "info": ["The process successful"],
        };

        var tempdata = await this.newPostService.getAllSertifikasiChart();
        try {
            data = tempdata[0].data;
        }
        catch (e) {
            data = [
                {
                    "id": "TIDAK BERSERTIFIKAT",
                    "total": 0,
                    "persentase": 0
                },
                {
                    "id": "BERSERTIFIKAT",
                    "total": 0,
                    "persentase": 0
                }
            ];
        }
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

        return { response_code: 202, messages, data };
    }

    @Post('api/posts/analityc/v2')
    @UseGuards(JwtAuthGuard)
    async getByChart(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/posts/analityc/v2";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

        var data = null;
        var startdate = null;
        var enddate = null;
        var datasummary = [];
        var lengviews = 0;
        var arrdataview = [];
        const messages = {
            "info": ["The process successful"],
        };
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["startdate"] !== undefined) {
            startdate = request_json["startdate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["enddate"] !== undefined) {
            enddate = request_json["enddate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);
            throw new BadRequestException("Unabled to proceed");
        }

        var date1 = new Date(startdate);
        var date2 = new Date(enddate);

        //calculate time difference  
        var time_difference = date2.getTime() - date1.getTime();

        //calculate days difference by dividing total milliseconds in a day  
        var resultTime = time_difference / (1000 * 60 * 60 * 24);
        console.log(resultTime);
        try {
            datasummary = await this.newPostService.analiticPost(startdate, enddate);
            lengviews = datasummary.length;
        }
        catch (e) {
            datasummary = [];
            lengviews = 0;
        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var diary = 0;
                var pict = 0;
                var vid = 0;
                var story = 0;
                for (var j = 0; j < lengviews; j++) {
                    if (datasummary[j].date == stdt) {
                        diary = datasummary[j].diary;
                        pict = datasummary[j].pict;
                        vid = datasummary[j].vid;
                        story = datasummary[j].story;
                        break;
                    }
                }
                arrdataview.push({
                    'date': stdt,
                    'diary': diary,
                    'pict': pict,
                    'vid': vid,
                    'story': story
                });

            }

        }
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

        return { response_code: 202, messages, data: arrdataview };
    }

    @Post('api/posts/interaksi/v2')
    @UseGuards(JwtAuthGuard)
    async getByCharti(@Req() request: Request, @Headers() headers): Promise<any> {
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/posts/interaksi/v2';

        var data = null;
        var startdate = null;
        var enddate = null;
        var datasummary = [];
        var lengviews = 0;
        var arrdataview = [];
        const messages = {
            "info": ["The process successful"],
        };
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["startdate"] !== undefined) {
            startdate = request_json["startdate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["enddate"] !== undefined) {
            enddate = request_json["enddate"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
            throw new BadRequestException("Unabled to proceed");
        }

        var date1 = new Date(startdate);
        var date2 = new Date(enddate);

        //calculate time difference  
        var time_difference = date2.getTime() - date1.getTime();

        //calculate days difference by dividing total milliseconds in a day  
        var resultTime = time_difference / (1000 * 60 * 60 * 24);
        console.log(resultTime);
        try {
            datasummary = await this.newPostService.analitycview(startdate, enddate);
            lengviews = datasummary.length;
        }
        catch (e) {
            datasummary = [];
            lengviews = 0;
        }

        if (resultTime > 0) {
            for (var i = 0; i < resultTime + 1; i++) {
                var dt = new Date(startdate);
                dt.setDate(dt.getDate() + i);
                var splitdt = dt.toISOString();
                var dts = splitdt.split('T');
                var stdt = dts[0].toString();
                var views = 0;
                var likes = 0;
                var comments = 0;

                for (var j = 0; j < lengviews; j++) {
                    if (datasummary[j].date == stdt) {
                        views = datasummary[j].views;
                        likes = datasummary[j].likes;
                        comments = datasummary[j].comments;

                        break;
                    }
                }
                arrdataview.push({
                    'date': stdt,
                    'views': views,
                    'likes': likes,
                    'comments': comments,

                });

            }

        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, messages, data: arrdataview };
    }

    @UseGuards(JwtAuthGuard)
    @Post('getusercontents/boostconsole/list/v2')
    async finddataboostbawah2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/getusercontents/boostconsole/list/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var statuspengajuan = [];
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
        var descending = null;
        var email = null;
        var type = null;
        var sessionid = [];
        var query = null;
        var data = null;
        var datasearch = null;
        var dataall = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        email = request_json["email"];
        type = request_json["type"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        sessionid = request_json["sessionid"];
        descending = request_json["descending"];
        statuspengajuan = request_json["statuspengajuan"];
        try {
            query = await this.newPostService.boostconsolebawah2(email, startdate, enddate, type, sessionid, statuspengajuan, descending, page, limit);
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

        // try {
        //     datasearch = await this.getusercontentsService.boostconsolebawahcount(email, startdate, enddate, type, sessionid, statuspengajuan);
        //     totalsearch = datasearch[0].totalpost;
        // } catch (e) {
        //     totalsearch = 0;
        // }

        // try {
        //     dataall = await this.getusercontentsService.boostconsolebawahcount(undefined, undefined, undefined, undefined, undefined, undefined);
        //     totalallrow = dataall[0].totalpost;

        // } catch (e) {
        //     totalallrow = 0;
        // }


        // var tpage = null;
        // var tpage2 = null;

        // tpage2 = (totalsearch / limit).toFixed(0);
        // tpage = (totalsearch % limit);
        // if (tpage > 0 && tpage < 5) {
        //     totalpage = parseInt(tpage2) + 1;

        // } else {
        //     totalpage = parseInt(tpage2);
        // }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, total, totalallrow: 0, totalsearch: 0, totalpage: 0, messages };

    }

    @UseGuards(JwtAuthGuard)
    @Post('getusercontents/boostconsole/v2')
    async finddataboost(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/getusercontents/boostconsole/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        //var request_json = JSON.parse(JSON.stringify(request.body));

        var query = null;
        var data = null;

        try {
            query = await this.newPostService.boostlistconsole();
            data = query;
        } catch (e) {
            query = null;
            data = [];
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/getusercontents/database/v2')
    async finddata2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var page = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var totalpage = 0;
        var totalallrow = 0;
        var totalsearch = 0;
        var total = 0;
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
        var iduser = null;
        var buy = null;
        var reported = null;
        var popular = null;
        var hashtag = null;
        var userid = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["page"] !== undefined) {
            page = request_json["page"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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
        buy = request_json["buy"];
        reported = request_json["reported"];
        popular = request_json["popular"];
        hashtag = request_json["hashtag"];
        if (request_json["limit"] !== undefined) {
            iduser = request_json["iduser"];
            userid = mongoose.Types.ObjectId(iduser);
        }
        var query = null;
        var datasearch = null;
        var dataall = null;

        if (iduser !== undefined) {
            try {
                query = await this.newPostService.databasenew2(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
                data = query;
            } catch (e) {
                query = null;
                data = [];
            }
        } else {
            try {
                query = await this.newPostService.databasenew2(buy, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
                data = query;
            } catch (e) {
                query = null;
                data = [];
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);


        return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }
}
