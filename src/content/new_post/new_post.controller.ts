import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Post, Body, Headers, BadRequestException, Param, Query, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateNewPostDTO, CreatenewPost2Dto } from './dto/create-newPost.dto';
import { NewpostsSchema } from './schemas/newPost.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { AvatarDTO, ProfileDTO } from 'src/utils/data/Profile';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { TagPeople } from '../posts/dto/create-posts.dto';
import { PostContentService } from '../posts/postcontent.service';
import { GetusercontentsService } from 'src/trans/getusercontents/getusercontents.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { MediamusicService } from '../mediamusic/mediamusic.service';
import { SettingsService } from 'src/trans/settings/settings.service';
@Controller('api/')
export class NewPostController {
    constructor(private readonly newPostService: NewPostService,
        private readonly utilsService: UtilsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly errorHandler: ErrorHandler,
        private readonly getcontenteventsService: ContenteventsService,
        private readonly logapiSS: LogapisService,
        private readonly postContentService: PostContentService,
        private readonly usercontentService: GetusercontentsService,
        private readonly disqusLogSS: DisquslogsService,
        private readonly musicSS: MediamusicService,
        private readonly settingsService: SettingsService
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('post/viewlike/v2')
    async getViewLike2(
        @Body() CreateGetcontenteventsDto_: CreatenewPost2Dto,
        @Headers() headers
    ) {
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        if (CreateGetcontenteventsDto_.postID == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed postID is required',
            );
        }

        if (CreateGetcontenteventsDto_.eventType == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed eventType is required',
            );
        }

        //Ceck POST ID
        const datapostsService = await this.newPostService.findOne(
            CreateGetcontenteventsDto_.postID.toString(),
        );
        if (await this.utilsService.ceckData(datapostsService)) {
            CreateGetcontenteventsDto_.receiverParty = datapostsService.email;
            CreateGetcontenteventsDto_.active = true;
            var data_contentevents = null;
            if (CreateGetcontenteventsDto_.eventType == "LIKE") {
                data_contentevents = datapostsService.userLike;
            }
            else {
                data_contentevents = datapostsService.userView;
            }

            var data_response = [];
            if (await this.utilsService.ceckData(data_contentevents)) {
                if (data_contentevents.length > 0) {
                    var start = (parseInt(CreateGetcontenteventsDto_.skip.toString())) * parseInt(CreateGetcontenteventsDto_.limit.toString());
                    var end = (parseInt(CreateGetcontenteventsDto_.skip.toString()) + 1) * parseInt(CreateGetcontenteventsDto_.limit.toString());
                    for (var i = start; i < end; i++) {
                        const data_profile = await this.basic2SS.finddetail(data_contentevents[i].toString());
                        var ProfileDTO_ = new ProfileDTO();
                        ProfileDTO_.fullName = data_profile.fullName;
                        ProfileDTO_.email = data_profile.email;
                        ProfileDTO_.username = data_profile.username;
                        ProfileDTO_.urluserBadge = data_profile.urluserBadge;
                        var AvatarDTO_ = new AvatarDTO();
                        if (data_profile.mediaBasePath != null || data_profile.mediaUri != null || data_profile.mediaType != null || data_profile.mediaEndpoint != null) {
                            if (data_profile.mediaBasePath != undefined) {
                                AvatarDTO_.mediaBasePath = data_profile.mediaBasePath;
                            }
                            if (data_profile.mediaUri != undefined) {
                                AvatarDTO_.mediaUri = data_profile.mediaUri;
                            }
                            if (data_profile.mediaType != undefined) {
                                AvatarDTO_.mediaType = data_profile.mediaType;
                            }
                            if (data_profile.mediaEndpoint != undefined) {
                                AvatarDTO_.mediaEndpoint = data_profile.mediaEndpoint;
                                var mediaEndpoint = data_profile.mediaEndpoint;
                                AvatarDTO_.profilePict_id = mediaEndpoint.replace("/profilepict/", "");
                            }
                            ProfileDTO_.avatar = AvatarDTO_;
                        } else {
                            ProfileDTO_.avatar = null;
                        }
                        data_response.push(ProfileDTO_);
                    }
                }
            }
            var response = {
                "response_code": 202,
                "data": data_response,
                "messages": {
                    "info": [
                        "successfully"
                    ]
                },
            }
            return response;
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed postID not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('posts/tagpeople/v2')
    async tagpeople(@Headers() headers, @Body() body) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/posts/tagpeople/v2";
        var reqbody = JSON.parse(JSON.stringify(body));

        //CECK BAEARER TOKEN
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed token and email not match',
            );
        }

        //CECK DATA USER
        const data_userbasic = await this.basic2SS.findbyemail(headers['x-auth-user']);
        if (!(await this.utilsService.ceckData(data_userbasic))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed User not found'
            );
        }

        if (body.postId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Param PostID required'
            );
        }

        var userEmail = headers['x-auth-user'];
        var post = await this.newPostService.findOne(body.postId.toString());
        // let following = await this.getcontenteventsService.findFollowing(userEmail);
        if (await this.utilsService.ceckData(post)) {
            if (post.tagPeople != undefined && post.tagPeople.length > 0) {
                let atp = post.tagPeople;
                let atp1 = Array<TagPeople>();

                for (let x = 0; x < atp.length; x++) {
                    let tp = atp[x];
                    if (tp?.namespace) {
                        let oid = tp.oid;
                        let ua = await this.basic2SS.findbyidauth(oid.toString());
                        if (ua != undefined) {
                            let tp1 = new TagPeople();
                            tp1.email = String(ua.email);
                            tp1.username = String(ua.username);

                            let ub = await this.basic2SS.finddetail(String(ua.email));
                            if (ub != undefined) {
                                var tempprofile = tp1.avatar;
                                try {
                                    if (ub.mediaBasePath != null || ub.mediaUri != null || ub.mediaType != null || ub.mediaEndpoint != null) {
                                        tempprofile.mediaBasePath = ub.mediaBasePath;
                                        tempprofile.mediaUri = ub.mediaUri;
                                        tempprofile.mediaType = ub.mediaType;
                                        tempprofile.mediaEndpoint = ub.mediaEndpoint;
                                    }

                                    tp1.avatar = tempprofile;
                                }
                                catch (e) {

                                }

                                if (await this.utilsService.ceckData(ub.urluserBadge)) {
                                    tp1.urluserBadge = ub.urluserBadge;
                                }
                                else {
                                    tp1.urluserBadge = null;
                                }
                            }

                            tp1.status = 'TOFOLLOW';
                            if (tp1.email == userEmail) {
                                tp1.status = "UNLINK";
                            } else {
                                var ceck_data_FOLLOWER = await this.getcontenteventsService.ceckData(tp1.email, "FOLLOWER", "ACCEPT", userEmail, "", "");
                                if (await this.utilsService.ceckData(ceck_data_FOLLOWER)) {
                                    if (ceck_data_FOLLOWER.active) {
                                        tp1.status = "FOLLOWING";
                                    }
                                }
                            }
                            atp1.push(tp1);
                        }
                    }
                }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

                return {
                    response_code: 202,
                    data: atp1,
                    messages: {
                        info: ['successfuly'],
                    },
                };
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Data Post not found'
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('getusercontents/database/v2')
    async finddata3(@Req() request, @Headers() headers): Promise<any> {
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
                query = await this.newPostService.databasenew(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
                data = query;
            } catch (e) {
                query = null;
                data = [];
            }
        } else {
            try {
                query = await this.newPostService.databasenew(buy, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
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

    @Post('getusercontents/database/details/v2')
    @UseGuards(JwtAuthGuard)
    async detailcontent(@Req() request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;
        var page = null;
        var limit = null;
        var datadetail = null;
        var lengdetail = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        page = request_json["page"];
        limit = request_json["limit"];

        const messages = {
            "info": ["The process successful"],
        };

        try {
            // datadetail = await this.getusercontentsService.detailcontent(postID, page, limit);
            datadetail = await this.newPostService.detailcontent(postID, page, limit);
            lengdetail = datadetail.length;
        } catch (e) {
            datadetail = null;
            lengdetail = 0;
        }
        if (lengdetail > 0) {

            var dataquery = null;
            dataquery = datadetail;
            var data = [];
            let pict: String[] = [];
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
                    let id = dataage[i]._id;

                    let persen = count * 100 / sumage;
                    objcoun = {
                        _id: id,
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
                    let id = datagender[i]._id;


                    let persen = count * 100 / sumgender;
                    objcoungender = {
                        _id: id,
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
                    let id = datawilayah[i]._id;

                    let persen = count * 100 / sumwilayah;
                    objcounwilayah = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumwilayah.push(objcounwilayah);
                }

            } else {
                dataSumwilayah = [];
            }

            let datadet = await this.usercontentService.getapsaraDatabaseDetail(dataquery, days, hours, minutes, seconds, dataSum, dataSumgender, dataSumwilayah);
            data.push(datadet[0]);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data, messages };
        }

        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Data is not found..!");
        }

    }

    @Post('getusercontents/searchdata/v2')
    @UseGuards(JwtAuthGuard)
    async contentsearch(@Req() request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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


        var user = [];
        var arrpict = [];
        var arrvid = [];
        var arrdiary = [];
        var picts = [];

        var vid = [];
        var diary = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;

        try {
            datasearch = await this.newPostService.findcontentbysearch(keys, email, skip, limit, listpict, listvid, listdiary, listuser);
            user = datasearch[0].user;

        } catch (e) {
            datasearch = null;
            user = [];

        }

        var setutil = require('util');
        console.log(setutil.inspect(datasearch, { showHidden: false, depth: null }));

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

            if (arrpict[0]._id !== undefined) {
                var listdata = [];
                var tempresult = null;
                var tempdata = null;
                for (var i = 0; i < lengpict; i++) {
                    tempdata = arrpict[i];
                    if (tempdata.isApsara == true) {
                        listdata.push(tempdata.apsaraId);
                    }
                    else {
                        listdata.push(undefined);
                    }
                }

                var apsaraimage = await this.postContentService.getImageApsara(listdata);
                tempresult = apsaraimage.ImageInfo;
                for (var loopimage = 0; loopimage < arrpict.length; loopimage++) {
                    for (var loopapsara = 0; loopapsara < tempresult.length; loopapsara++) {
                        if (tempresult[loopapsara].ImageId == arrpict[loopimage].apsaraId) {
                            arrpict[loopimage].media =
                            {
                                "ImageInfo": [tempresult[loopapsara]]
                            }
                        }
                    }

                    if (arrpict[loopimage].isApsara == false && (arrpict[loopimage].mediaType == "image" || arrpict[loopimage].mediaType == "images")) {
                        arrpict[loopimage].media =
                        {
                            "ImageInfo": []
                        }
                    }

                    picts.push(arrpict[loopimage]);
                }
            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {
                var listdata = [];
                var tempresult = null;
                var tempdata = null;
                for (var i = 0; i < lengvid; i++) {
                    tempdata = arrvid[i];
                    if (tempdata.isApsara == true) {
                        listdata.push(tempdata.apsaraId);
                    }
                    else {
                        listdata.push(undefined);
                    }
                }

                var apsaravideo = await this.postContentService.getVideoApsara(listdata);
                tempresult = apsaravideo.VideoList;
                for (var loopvid = 0; loopvid < arrvid.length; loopvid++) {
                    for (var loopapsara = 0; loopapsara < tempresult.length; loopapsara++) {
                        if (loopapsara == loopvid) {
                            if (tempresult[loopapsara].VideoId == arrvid[loopvid].apsaraId) {
                                arrvid[loopvid].media =
                                {
                                    "VideoList": [tempresult[loopapsara]]
                                }
                            }
                        }

                    }

                    if (arrvid[loopvid].isApsara == false && arrvid[loopvid].mediaType == "video") {
                        arrvid[loopvid].media =
                        {
                            "VideoList": []
                        }
                    }

                    vid.push(arrvid[loopvid]);
                }
            } else {
                vid = [];
            }
        } else {
            vid = [];
        }

        if (lengdiary > 0) {
            console.log(arrdiary);
            if (arrdiary[0]._id !== undefined) {
                var listdata = [];
                var tempresult = null;
                var tempdata = null;
                for (var i = 0; i < lengdiary; i++) {
                    tempdata = arrdiary[i];
                    if (tempdata.isApsara == true) {
                        listdata.push(tempdata.apsaraId);
                    }
                    else {
                        listdata.push(undefined);
                    }
                }

                var apsaravideo = await this.postContentService.getVideoApsara(listdata);
                tempresult = apsaravideo.VideoList;
                for (var loopvid = 0; loopvid < arrdiary.length; loopvid++) {
                    for (var loopapsara = 0; loopapsara < tempresult.length; loopapsara++) {
                        if (loopapsara == loopvid) {
                            if (tempresult[loopapsara].VideoId == arrdiary[loopvid].apsaraId) {
                                arrdiary[loopvid].media =
                                {
                                    "VideoList": [tempresult[loopapsara]]
                                }
                            }
                        }

                    }

                    if (arrdiary[loopvid].isApsara == false && arrdiary[loopvid].mediaType == "video") {
                        arrdiary[loopvid].media =
                        {
                            "VideoList": []
                        }
                    }
                    diary.push(arrdiary[loopvid]);
                }
            } else {
                diary = [];
            }
        } else {
            diary = [];
        }

        data = [{

            user, picts, vid, diary
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('getusercontents/management/konten/group/v2')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagementkontenfilterss(@Req() request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var email = null;
        var skip = 0;
        var limit = 0;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["limit"] !== undefined) {
            limit = request_json["limit"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.basic2SS.findbyemail(email);
        var iduser = ubasic._id;
        var userid = mongoose.Types.ObjectId(iduser);

        console.log(userid);
        const messages = {
            "info": ["The process successful"],
        };

        var datatotal = await this.newPostService.findcountfilter(email);
        var totalAll = datatotal[0].totalpost;
        let dataFilter = await this.newPostService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, 0, totalAll);
        let data = await this.newPostService.findalldatakontenmultiple(userid, email, ownership, monetesisasi, buy, archived, reported, postType, startdate, enddate, skip, limit);
        var totalFilter = dataFilter.length;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, skip, limit, totalFilter, totalAll, messages };
    }

    @Post('getusercontents/boostconsole/list/details/v2')
    @UseGuards(JwtAuthGuard)
    async detailcontentboostv2(@Req() request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var postID = null;
        var page = null;
        var limit = null;
        var datadetail = null;
        var lengdetail = null;
        var startdate = null;
        var enddate = null;
        var lengviews = 0;
        var datasummary = [];
        var datacountlike = null;
        var datacountcomment = null;
        var startboost = null;
        var endboost = null;
        var dtstart = null;
        var dtend = null;
        var datakomentar = [];
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        page = request_json["page"];
        limit = request_json["limit"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        const messages = {
            "info": ["The process successful"],
        };

        console.log(await this.utilsService.getDateTimeString());
        try {
            datadetail = await this.newPostService.boostdetail2(postID, startdate, enddate, page, limit);
            lengdetail = datadetail.length;
            lengviews = datadetail[0].summary.length;
            startboost = datadetail[0].data[0].start;
            endboost = datadetail[0].data[0].end;

        } catch (e) {
            datadetail = null;
            lengdetail = 0;
            lengviews = 0;
        }
        console.log(await this.utilsService.getDateTimeString());
        if (lengdetail > 0) {

            var dataquery = null;
            dataquery = datadetail;
            var data = [];
            let pict: String[] = [];
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
            var arrdataview = [];
            var like = 0;
            var comment = 0;
            datasummary = datadetail[0].summary;


            dtstart = startboost.substring(0, 10);
            dtend = endboost.substring(0, 10);
            var date1 = new Date(startdate);
            var date2 = new Date(enddate);

            //calculate time difference  
            var time_difference = date2.getTime() - date1.getTime();

            //calculate days difference by dividing total milliseconds in a day  
            var resultTime = time_difference / (1000 * 60 * 60 * 24);
            console.log(resultTime);

            try {
                datakomentar = await this.disqusLogSS.komentar2(postID, dtstart, dtend);
            } catch (e) {
                datakomentar = [];
            }
            try {
                datacountlike = await this.getcontenteventsService.countLikeBoost(postID, dtstart, dtend);
            } catch (e) {
                datacountlike = null;
            }

            if (datacountlike.length === 0) {
                like = 0;
            } else {
                like = datacountlike[0].count;
            }

            try {
                comment = datakomentar.length;
            } catch (e) {
                comment = 0;
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
                        if (datasummary[j].date == stdt) {
                            count = datasummary[j].jangkauan;
                            break;
                        }
                    }
                    arrdataview.push({
                        'date': stdt,
                        'count': count
                    });

                }

            }

            try {
                dataage = datadetail[0].age;
                if (dataage[0]._id == "other" && dataage[0].count == 1) {
                    lengage = 0;
                } else {
                    lengage = dataage.length;
                }

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
                    let id = dataage[i]._id;

                    let persen = count * 100 / sumage;
                    objcoun = {
                        _id: id,
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
                if (datagender[0]._id == "OTHER" && datagender[0].count == 1) {
                    lenggender = 0;
                } else {
                    lenggender = datagender.length;
                }
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
                    let id = datagender[i]._id;
                    let idgender = null;
                    if (id == null) {
                        idgender = "OTHER";
                    } else {
                        idgender = id;
                    }


                    let persen = count * 100 / sumgender;
                    objcoungender = {
                        _id: idgender,
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
                    let id = datawilayah[i]._id;

                    let persen = count * 100 / sumwilayah;
                    objcounwilayah = {
                        _id: id,
                        count: count,
                        persen: persen.toFixed(2)
                    }
                    dataSumwilayah.push(objcounwilayah);
                }

            } else {
                dataSumwilayah = [];
            }

            let datadet = await this.usercontentService.getapsaraContenBoostDetail(dataquery, dataSum, dataSumgender, dataSumwilayah, arrdataview, sumage, like, comment, datakomentar);
            data.push(datadet[0]);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data, messages };
        }

        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            return { response_code: 202, data: [], messages };
        }

    }

    @UseGuards(JwtAuthGuard)
    //@Get('api/getusercontents/musiccard')
    @Get('musiccard/v2')
    async getMusicCard2(@Headers() headers) {
        const data = await this.newPostService.getmusicCard();

        //CREATE ARRAY APSARA THUMNAIL
        let thumnail_data_artist: string[] = [];
        for (let i = 0; i < data[0].artistPopuler.length; i++) {
            let data_item = data[0].artistPopuler[i];
            if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
                thumnail_data_artist.push(data_item._id.apsaraThumnail.toString());
            }
        }
        let thumnail_data_music: string[] = [];
        for (let i = 0; i < data[0].musicPopuler.length; i++) {
            let data_item = data[0].musicPopuler[i];
            if (data_item._id.apsaraThumnail != undefined && data_item._id.apsaraThumnail != "" && data_item._id.apsaraThumnail != null) {
                thumnail_data_music.push(data_item._id.apsaraThumnail.toString());
            }
        }

        //GET DATA APSARA THUMNAIL
        var dataApsaraThumnail_artist = await this.musicSS.getImageApsara(thumnail_data_artist);
        var dataApsaraThumnail_music = await this.musicSS.getImageApsara(thumnail_data_music);

        var data_artist = await Promise.all(data[0].artistPopuler.map(async (item, index) => {
            //APSARA THUMNAIL
            var apsaraThumnailUrl = null
            if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
                apsaraThumnailUrl = dataApsaraThumnail_artist.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
            }

            return {
                _id: {
                    artistName: item._id.artistName,
                    apsaraMusic: item._id.apsaraMusic,
                    apsaraThumnail: item._id.apsaraThumnail,
                    apsaraThumnailUrl: apsaraThumnailUrl
                }
            };
        }));

        var data_music = await Promise.all(data[0].musicPopuler.map(async (item, index) => {
            //APSARA THUMNAIL
            var apsaraThumnailUrl = null
            if (item._id.apsaraThumnail != undefined && item._id.apsaraThumnail != "" && item._id.apsaraThumnail != null) {
                apsaraThumnailUrl = dataApsaraThumnail_music.ImageInfo.find(x => x.ImageId == item._id.apsaraThumnail).URL;
            }

            return {
                _id: {
                    musicTitle: item._id.musicTitle,
                    apsaraMusic: item._id.apsaraMusic,
                    apsaraThumnail: item._id.apsaraThumnail,
                    apsaraThumnailUrl: apsaraThumnailUrl
                }
            };
        }));

        data[0].artistPopuler = data_artist;
        data[0].musicPopuler = data_music;


        var Response = {
            response_code: 202,
            data: data,
            messages: {
                info: [
                    "Retrieved music card succesfully"
                ]
            }
        }
        return Response;
    }

    @UseGuards(JwtAuthGuard)
    @Get('music/used/v2/:id')
    async getOneMusicPost(@Param('id') id: string, @Req() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        if (headers['x-auth-user'] == undefined || headers['x-auth-token'] == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }
        if (id == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param id is required',
            );
        }

        var data = await this.newPostService.findByMusicId(id);
        console.log(data.length);
        // if (data.length > 0) {
        //   if (data[0].apsaraMusic != undefined) {
        //     var dataApsaraMusic = await this.mediamusicService.getVideoApsaraSingle(data[0].apsaraMusic)
        //     var apsaraMusicData = {
        //       PlayURL: dataApsaraMusic.PlayInfoList.PlayInfo[0].PlayURL,
        //       Duration: dataApsaraMusic.PlayInfoList.PlayInfo[0].Duration,
        //     }
        //     data[0]["music"] = apsaraMusicData;
        //   }
        //   if (data[0].apsaraThumnail != undefined) {
        //     var dataApsaraThumnail = await this.mediamusicService.getImageApsara([data[0].apsaraThumnail])
        //     data[0]["apsaraThumnailUrl"] = dataApsaraThumnail.ImageInfo.find(x => x.ImageId == data[0].apsaraThumnail).URL;
        //   }
        // }
        var Response = {
            data: data,
            response_code: 202,
            messages: {
                info: [
                    "Get music succesfully"
                ]
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, null);

        return Response;
    }

    @Post('getusercontents/buy/details/v2')
    @UseGuards(JwtAuthGuard)
    async contentuserdetailbuy2(@Req() request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = null;
        var postID = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        let databuy = await this.newPostService.findcontenbuy(postID);
        console.log(databuy);

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Content not for sell..!");
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Get('posts/getboost/v2')
    async getPostBoost(
        @Query('pageNumber') pageNumber: number,
        @Query('pageRow') pageRow: number,
        @Headers() headers) {
        const pageNumber_ = (pageNumber != undefined) ? pageNumber : 0;
        const pageRow_ = (pageRow != undefined) ? (pageRow != 0) ? pageRow : 10 : 10;
        console.log(pageNumber_);
        console.log(pageRow_);
        return this.newPostService.getUserPostBoost(pageNumber_, pageRow_, headers);
    }

    @UseGuards(JwtAuthGuard)
    @Post('posts/getuserposts/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    async getUserPost(@Body() body, @Headers() headers): Promise<any> 
    {
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
                response_code : 204,
                message : {
                    "info":[
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
            try
            {
                getmusicapsara = tempdata.music.apsaraThumnail;
            }
            catch(e)
            {
                getmusicapsara = undefined;
            }
            listmusic.push(getmusicapsara);
        }

        //console.log(listdata);
        var apsaraimagedata = await this.postContentService.getImageApsara(listdata);
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

        var apsaravideodata = await this.postContentService.getVideoApsara(listdata);
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
            response_code:202,
            data:data,
            version:version
        }
    }
}
