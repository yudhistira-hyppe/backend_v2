import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Post, Body, Headers, BadRequestException, Param, Query, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreatePostRequest, CreatePostResponse, GetcontenteventsDto } from './dto/create-newPost.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';
import { MediastikerService } from '../mediastiker/mediastiker.service';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { NewPostContentService } from './new_postcontent.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { SettingsService } from 'src/trans/settings/settings.service';
import { UtilsService } from 'src/utils/utils.service';
import { Request } from 'express';
import { TransactionsPostService } from 'src/trans/transactionpost/transactionspost.service';
import { ErrorHandler } from 'src/utils/error.handler';
import { PostchallengeService } from 'src/trans/postchallenge/postchallenge.service';
import { TagCountService } from '../tag_count/tag_count.service';
import { TagCountDto } from '../tag_count/dto/create-tag_count.dto';
import { InterestCountService } from '../interest_count/interest_count.service';
import { InterestCountDto } from '../interest_count/dto/create-interest_count.dto';
import { InterestdayService } from '../interestday/interestday.service';
import { InterestdayDto } from '../interestday/dto/create-interestday.dto';
import { PostContentService } from '../../content/posts/postcontent.service';
import { PostsService } from '../../content/posts/posts.service';
@Controller('api/')
export class NewPostController {
    private readonly logger = new Logger(NewPostController.name);
    constructor(
        private readonly newPostContentService: NewPostContentService,
        private readonly newPostService: NewPostService,
        private readonly mediastikerService: MediastikerService,
        private readonly contenteventsService: ContenteventsService,
        private readonly basic2SS: UserbasicnewService,
        private readonly logapiSS: LogapisService,
        private readonly settingsService: SettingsService,
        private readonly utilsService: UtilsService,
        private transactionsPostService: TransactionsPostService,
        private readonly errorHandler: ErrorHandler,
        private readonly postchallengeService: PostchallengeService,
        private readonly tagCountService: TagCountService,
        private readonly interestCountService: InterestCountService,
        private readonly interestdayService: InterestdayService,
        private readonly PostContentService: PostContentService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('posts/createpost/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    async createPostV4new(@UploadedFile() file: Express.Multer.File, @Body() CreatePostRequest_: CreatePostRequest, @Headers() headers): Promise<CreatePostResponse> {
        console.log('============================================== CREATE POST HEADERS ==============================================', JSON.stringify(headers));
        console.log('============================================== CREATE POST BODY ==============================================', JSON.stringify(CreatePostRequest_));
        if (CreatePostRequest_.stiker !== undefined && CreatePostRequest_.image !== undefined && CreatePostRequest_.type !== undefined && CreatePostRequest_.position !== undefined) {

            var arrayStiker = [];
            var stiker = CreatePostRequest_.stiker;

            var splitstiker = stiker.toString();
            var splitreq2stiker = splitstiker.split(',');

            var image = CreatePostRequest_.image;
            var splitimage = image.toString();
            var splitreq2image = splitimage.split(',');

            var type = CreatePostRequest_.type;
            var splittype = type.toString();
            var splitreq2type = splittype.split(',');

            var position = CreatePostRequest_.position;
            var splitposition = position.toString();
            var splitreq2position = splitposition.split('#');

            if (splitreq2stiker.length !== splitreq2image.length && splitreq2stiker.length !== splitreq2type.length && splitreq2stiker.length !== splitreq2position.length) {
                throw new BadRequestException("Unabled to proceed,the length of data must be the same");
            } else {
                for (var i = 0; i < splitreq2stiker.length; i++) {
                    let id = splitreq2stiker[i];
                    let image = splitreq2image[i];
                    let type = splitreq2type[i];
                    let position = splitreq2position[i];
                    var ids = new mongoose.Types.ObjectId(id);
                    let arrayPosition = [];
                    let splitpos = position.split(',');
                    for (let x = 0; x < splitpos.length; x++) {
                        var num = parseFloat(splitpos[x]);
                        arrayPosition.push(num);
                    }

                    var obj = {
                        "_id": ids,
                        "image": image,
                        "position": arrayPosition,
                        "type": type
                    };
                    arrayStiker.push(obj);
                }
                CreatePostRequest_.stiker = arrayStiker;
            }
        }

        if (CreatePostRequest_.text !== undefined) {

            var arraytext = [];
            var text = CreatePostRequest_.text;

            var splitreqtext = text.toString();
            var splitreq2text = splitreqtext.split(',');

            for (var i = 0; i < splitreq2text.length; i++) {
                let idtext = splitreq2text[i];
                arraytext.push(idtext);
            }
            CreatePostRequest_.text = arraytext;
        }
        var data = await this.newPostContentService.createNewPostV5(file, CreatePostRequest_, headers);

        if (data !== undefined && data !== null) {
            console.log(arrayStiker)

            if (arrayStiker !== undefined && arrayStiker.length > 0) {
                this.updateused(arrayStiker);
            }

            var postID = data.data.postID;

            var email = data.data.email;

            const databasic = await this.basic2SS.findBymail(
                email
            );
            var iduser = null;
            if (databasic !== null) {
                iduser = databasic._id;
                //this.scorepostrequest(iduser.toString(), postID.toString(), "posts", "POST", postID);
            }
        }

        return data;
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/posts/updatepost/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    async updatePostnew(@Body() body, @Headers() headers): Promise<CreatePostResponse> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/posts/updatepost";
        var reqbody = body;

        this.logger.log("updatePost >>> start");
        var email = headers['x-auth-user'];
        var saleAmount = body.saleAmount;
        var data = null;
        var datapostchallenge = null;
        var active = null;
        var dataUser = await this.basic2SS.findBymail(email);
        var posts = null;
        var startDatetime = null;
        var endDatetime = null;

        try {
            posts = await this.newPostService.findid(body.postID.toString());
        } catch (e) {
            posts = null;
        }
        var dataTransaction = await this.transactionsPostService.findpostid(body.postID.toString());
        if (await this.utilsService.ceckData(dataTransaction)) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);
            if (((dataUser.languagesLangIso != undefined ? dataUser.languagesLangIso:"id")) == "id") {
                await this.errorHandler.generateNotAcceptableException(
                    "Tidak bisa mengedit postingan karena sedang dalam proses pembayaran",
                );
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    " Unable to edit the post because it is in the process of payment.",
                );
            }
        }
        try {
            datapostchallenge = await this.postchallengeService.findBypostID2(body.postID.toString());
        } catch (e) {
            datapostchallenge = null;
        }

        if (body.active == 'false') {
            let datapostawal = null;
            let tags = [];
            let cats = [];
            //tags
            try {
                datapostawal = await this.newPostService.findByPostId(body.postID);
                tags = datapostawal.tags;
                cats = datapostawal.category;
            } catch (e) {
                datapostawal = null;
                tags = [];
                cats = [];
            }

            if (datapostchallenge == null) {
                if (tags.length > 0) {
                    const stringSet = new Set(tags);
                    const uniqstring = [...stringSet];
                    console.log(uniqstring)
                    for (let i = 0; i < uniqstring.length; i++) {
                        let id = uniqstring[i];

                        let datatag2 = null;
                        try {
                            datatag2 = await this.tagCountService.findOneById(id);
                        } catch (e) {
                            datatag2 = null;
                        }

                        let total = 0;
                        if (datatag2 !== null) {
                            let postidlist = datatag2.listdata;
                            total = datatag2.total;

                            for (let i = 0; i < postidlist.length; i++) {
                                if (postidlist[i].postID === body.postID) {
                                    postidlist.splice(i, 1);
                                }
                            }
                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_.total = total - 1;
                            tagCountDto_.listdata = postidlist;
                            await this.tagCountService.update(id, tagCountDto_);
                        }
                    }
                }
                //interest
                if (cats.length > 0) {
                    const stringSetin = new Set(cats);
                    const uniqstringin = [...stringSetin];

                    console.log(uniqstringin)

                    for (let i = 0; i < uniqstringin.length; i++) {
                        let idin = uniqstringin[i];

                        let datain = null;
                        try {
                            datain = await this.interestCountService.findOneById(idin);
                        } catch (e) {
                            datain = null;
                        }

                        let totalin = 0;
                        if (datain !== null) {
                            let postidlistin = datain.listdata;
                            totalin = datain.total;

                            for (let i = 0; i < postidlistin.length; i++) {
                                if (postidlistin[i].postID === body.postID) {
                                    postidlistin.splice(i, 1);
                                }
                            }
                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_.total = totalin - 1;
                            tagCountDto_.listdata = postidlistin;
                            await this.tagCountService.update(idin, tagCountDto_);
                        }


                    }
                }
                data = await this.newPostContentService.updatePost(body, headers, dataUser);
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
                if (saleAmount > 0) {
                    await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
                    //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
                }
                return data;
            } else {
                var datenow = new Date(Date.now());
                startDatetime = datapostchallenge.startDatetime;
                endDatetime = datapostchallenge.endDatetime;
                if (tags.length > 0) {
                    const stringSet = new Set(tags);
                    const uniqstring = [...stringSet];
                    console.log(uniqstring)
                    for (let i = 0; i < uniqstring.length; i++) {
                        let id = uniqstring[i];
                        let datatag2 = null;
                        try {
                            datatag2 = await this.tagCountService.findOneById(id);
                        } catch (e) {
                            datatag2 = null;
                        }
                        let total = 0;
                        if (datatag2 !== null) {
                            let postidlist = datatag2.listdata;
                            total = datatag2.total;
                            for (let i = 0; i < postidlist.length; i++) {
                                if (postidlist[i].postID === body.postID) {
                                    postidlist.splice(i, 1);
                                }
                            }
                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_.total = total - 1;
                            tagCountDto_.listdata = postidlist;
                            await this.tagCountService.update(id, tagCountDto_);
                        }
                    }
                }
                //interest
                if (cats.length > 0) {
                    const stringSetin = new Set(cats);
                    const uniqstringin = [...stringSetin];

                    console.log(uniqstringin)

                    for (let i = 0; i < uniqstringin.length; i++) {
                        let idin = uniqstringin[i];

                        let datain = null;
                        try {
                            datain = await this.interestCountService.findOneById(idin);
                        } catch (e) {
                            datain = null;
                        }

                        let totalin = 0;
                        if (datain !== null) {
                            let postidlistin = datain.listdata;
                            totalin = datain.total;

                            for (let i = 0; i < postidlistin.length; i++) {
                                if (postidlistin[i].postID === body.postID) {
                                    postidlistin.splice(i, 1);
                                }
                            }
                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_.total = totalin - 1;
                            tagCountDto_.listdata = postidlistin;
                            await this.tagCountService.update(idin, tagCountDto_);
                        }


                    }
                }
                data = await this.newPostContentService.updatePost(body, headers, dataUser);
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
                // if (saleAmount > 0) {
                //   await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
                //   //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
                // }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

                let datapostchallenge2 = null;
                try {
                    datapostchallenge2 = await this.postchallengeService.findOneBypostid(body.postID.toString());
                } catch (e) {
                    datapostchallenge2 = null;
                }

                if (datapostchallenge2.length > 0) {

                    for (let y = 0; y < datapostchallenge2.length; y++) {
                        let postid = null;
                        let idChallenge = null;
                        let idSubChallenge = null;
                        postid = datapostchallenge2[y].postID;
                        idSubChallenge = datapostchallenge2[y].idSubChallenge;
                        idChallenge = datapostchallenge2[y].idChallenge;
                        await this.newPostService.deletePostChalenge(postid, idChallenge, idSubChallenge);
                    }

                }





                return data;

                //}
            }
        }else {
            var datapostawal = null;
            var tags = [];
            var arrtag = [];
            var datacats = null;
            var arrcat = [];
            var cats = [];
            try {
                datapostawal = await this.newPostService.findByPostId(body.postID);
                tags = datapostawal.tags;
                cats = datapostawal.category;
            } catch (e) {
                datapostawal = null;
                tags = [];
                cats = [];
            }
            var datatag = null;
            if (datapostchallenge == null) {
                if (tags.length > 0) {
                    if (body.tags !== undefined && body.tags !== "") {
                        var tag = body.tags;

                        var splittag = tag.split(',');
                        for (let x = 0; x < splittag.length; x++) {
                            var tagkata = tags[x];
                            var tagreq = splittag[x].replace(/"/g, "");
                            arrtag.push(tagreq)
                            if (tagreq !== undefined && tagreq !== tagkata) {
                                try {
                                    datatag = await this.tagCountService.findOneById(tagkata);
                                } catch (e) {
                                    datatag = null;
                                }
                                var total = 0;
                                if (datatag !== null) {
                                    var postidlist = datatag.listdata;
                                    total = datatag.total;
                                    for (var i = 0; i < postidlist.length; i++) {
                                        if (postidlist[i].postID === body.postID) {
                                            postidlist.splice(i, 1);
                                        }
                                    }
                                    let tagCountDto_ = new TagCountDto();
                                    tagCountDto_.total = total - 1;
                                    tagCountDto_.listdata = postidlist;
                                    await this.tagCountService.update(tagkata, tagCountDto_);
                                }
                            }
                        }
                        body.tags = arrtag;
                    } else {
                        body.tags = [];

                    }

                } else {
                    body.tags = [];

                }

                //interest

                if (cats.length > 0) {
                    if (body.cats !== undefined && body.cats !== "") {
                        var cat = body.cats;
                        var splittcat = null;
                        if (cat !== undefined && cat !== "") {
                            splittcat = cat.split(',');
                            for (let x = 0; x < splittcat.length; x++) {

                                var tagcat = null;
                                try {
                                    tagcat = cats[x].oid.toString();
                                } catch (e) {
                                    tagcat = "";
                                }
                                var catreq = splittcat[x];

                                if (catreq !== undefined && catreq !== tagcat) {

                                    try {
                                        datacats = await this.interestCountService.findOneById(tagcat);
                                    } catch (e) {
                                        datacats = null;
                                    }
                                    var total = 0;
                                    if (datacats !== null) {
                                        let postidlist = datacats.listdata;
                                        total = datacats.total;

                                        for (var i = 0; i < postidlist.length; i++) {
                                            if (postidlist[i].postID === body.postID) {
                                                postidlist.splice(i, 1);
                                            }
                                        }
                                        let catCountDto_ = new InterestCountDto();
                                        catCountDto_.total = total - 1;
                                        catCountDto_.listdata = postidlist;
                                        await this.interestCountService.update(tagcat, catCountDto_);
                                    }
                                }
                            }
                        }

                    } else {
                        body.cats = [];
                    }

                }
                data = await this.newPostContentService.updatePost(body, headers, dataUser);
                //tags
                if (body.tags !== undefined && body.tags.length > 0) {
                    var tag2 = body.tags;
                    for (let i = 0; i < tag2.length; i++) {
                        let id = tag2[i];
                        var datatag2 = null;

                        try {
                            datatag2 = await this.tagCountService.findOneById(id);

                        } catch (e) {
                            datatag2 = null;

                        }

                        if (datatag2 === null) {

                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_._id = id;
                            tagCountDto_.total = 1;
                            tagCountDto_.listdata = [{ "postID": body.postID }];
                            await this.tagCountService.create(tagCountDto_);
                        } else {

                            var datatag3 = null;
                            var lengdata3 = null;

                            try {
                                datatag3 = await this.tagCountService.finddatabypostid(id, body.postID);
                                lengdata3 = datatag3.length;

                            } catch (e) {
                                datatag3 = null;
                                lengdata3 = 0;
                            }
                            var datapost = null;
                            var tagslast = [];
                            try {
                                datapost = await this.newPostService.findByPostId(body.postID);
                                tagslast = datapost.tags;
                            } catch (e) {
                                datapost = null;
                                tagslast = [];
                            }
                            let idnew = tagslast[i];
                            var total2 = 0;
                            var postidlist2 = [];
                            let obj = { "postID": body.postID };
                            total2 = datatag2.total;
                            postidlist2 = datatag2.listdata;
                            if (id === idnew) {
                                if (lengdata3 == 0) {
                                    postidlist2.push(obj);
                                }
                            }

                            let tagCountDto_ = new TagCountDto();
                            tagCountDto_._id = id;
                            if (id === idnew) {

                                if (lengdata3 == 0) {
                                    tagCountDto_.total = total2 + 1;
                                }
                            }

                            tagCountDto_.listdata = postidlist2;
                            await this.tagCountService.update(id, tagCountDto_);
                        }

                    }
                } else {

                }

                //Interest
                const mongoose = require('mongoose');
                var ObjectId = require('mongodb').ObjectId;

                if (body.cats !== undefined) {
                    let cats = body.cats;
                    var splitcats = cats.split(',');
                    for (let i = 0; i < splitcats.length; i++) {
                        let id = splitcats[i];
                        var datacats = null;
                        var datacatsday = null;

                        try {
                            datacats = await this.interestCountService.findOneById(id);

                        } catch (e) {
                            datacats = null;

                        }

                        if (datacats === null) {


                            let interestCountDto_ = new InterestCountDto();
                            interestCountDto_._id = mongoose.Types.ObjectId(id);
                            interestCountDto_.total = 1;
                            interestCountDto_.listdata = [{ "postID": body.postID }];
                            await this.interestCountService.create(interestCountDto_);


                        }
                        else {


                            var catslast = [];
                            var datapostawal = null;

                            try {
                                datapostawal = await this.newPostService.findByPostId(body.postID);
                                catslast = datapostawal.category;
                            } catch (e) {
                                datapostawal = null;
                                catslast = [];
                            }
                            let idnew = catslast[i].oid.toString();
                            var totalcats = 0;
                            var postidlistcats = [];
                            let obj = { "postID": datapostawal.postID };
                            totalcats = datacats.total;
                            postidlistcats = datacats.listdata;
                            if (id !== idnew) {
                                postidlistcats.push(obj);
                            }

                            let interestCountDto_ = new InterestCountDto();
                            interestCountDto_._id = mongoose.Types.ObjectId(id);
                            if (id !== idnew) {
                                interestCountDto_.total = totalcats + 1;
                            }
                            interestCountDto_.listdata = postidlistcats;
                            await this.interestCountService.update(id, interestCountDto_);
                        }

                        var dt = new Date(Date.now());
                        dt.setHours(dt.getHours() + 7); // timestamp
                        dt = new Date(dt);
                        var strdate = dt.toISOString();
                        var repdate = strdate.replace('T', ' ');
                        var splitdate = repdate.split('.');
                        var stringdate = splitdate[0];
                        var date = stringdate.substring(0, 10) + " " + "00:00:00";
                        var cekdata = null;

                        try {
                            cekdata = await this.interestdayService.finddate(date);

                        } catch (e) {
                            cekdata = null;

                        }

                        try {
                            datacatsday = await this.interestdayService.finddatabydate(date, id);

                        } catch (e) {
                            datacatsday = null;

                        }

                        if (cekdata.length == 0) {
                            let interestdayDto_ = new InterestdayDto();
                            interestdayDto_.date = date;
                            interestdayDto_.listinterest = [{
                                "_id": mongoose.Types.ObjectId(id),
                                "total": 1,
                                "createdAt": stringdate,
                                "updatedAt": stringdate
                            }];
                            await this.interestdayService.create(interestdayDto_);
                        } else {
                            if (datacatsday.length > 0) {
                                var idq = datacatsday[0]._id;
                                var idint = datacatsday[0].listinterest._id;
                                var totalint = datacatsday[0].listinterest.total;
                                await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
                            } else {
                                var idInt = cekdata[0]._id.toString();
                                var list = cekdata[0].listinterest;
                                var objin = {
                                    "_id": mongoose.Types.ObjectId(id),
                                    "total": 1,
                                    "createdAt": stringdate,
                                    "updatedAt": stringdate
                                };
                                list.push(objin);
                                await this.interestdayService.updateInterestday(idInt, list);
                            }
                        }

                    }
                }

                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
                console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
                if (saleAmount > 0) {
                    await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
                    //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
                }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

                return data;
            }else {
                var datenow = new Date(Date.now());
                startDatetime = datapostchallenge.startDatetime;
                endDatetime = datapostchallenge.endDatetime;

                if (datenow >= new Date(startDatetime) && datenow <= new Date(endDatetime) && saleAmount > 0) {
                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

                    await this.errorHandler.generateNotAcceptableException(
                        'Unabled to proceed, content is participating in the challenge',
                    );
                }else {
                    if (tags.length > 0) {
                        if (body.tags !== undefined && body.tags !== "") {
                            var tag = body.tags;
                            var splittag = tag.split(',');
                            for (let x = 0; x < splittag.length; x++) {
                                var tagkata = tags[x];
                                var tagreq = splittag[x].replace(/"/g, "");
                                arrtag.push(tagreq)
                                if (tagreq !== undefined && tagreq !== tagkata) {
                                    try {
                                        datatag = await this.tagCountService.findOneById(tagkata);
                                    } catch (e) {
                                        datatag = null;
                                    }
                                    var total = 0;
                                    if (datatag !== null) {
                                        var postidlist = datatag.listdata;
                                        total = datatag.total;
                                        for (var i = 0; i < postidlist.length; i++) {
                                            if (postidlist[i].postID === body.postID) {
                                                postidlist.splice(i, 1);
                                            }
                                        }
                                        let tagCountDto_ = new TagCountDto();
                                        tagCountDto_.total = total - 1;
                                        tagCountDto_.listdata = postidlist;
                                        await this.tagCountService.update(tagkata, tagCountDto_);
                                    }
                                }
                            }
                            body.tags = arrtag;
                        } else {
                            body.tags = [];

                        }

                    } else {
                        body.tags = [];

                    }

                    //interest

                    if (cats.length > 0) {
                        if (body.cats !== undefined && body.cats !== "") {
                            var cat = body.cats;
                            var splittcat = null;
                            if (cat !== undefined && cat !== "") {
                                splittcat = cat.split(',');
                                for (let x = 0; x < splittcat.length; x++) {

                                    var tagcat = null;
                                    try {
                                        tagcat = cats[x].oid.toString();
                                    } catch (e) {
                                        tagcat = "";
                                    }
                                    var catreq = splittcat[x];

                                    if (catreq !== undefined && catreq !== tagcat) {

                                        try {
                                            datacats = await this.interestCountService.findOneById(tagcat);
                                        } catch (e) {
                                            datacats = null;
                                        }
                                        var total = 0;
                                        if (datacats !== null) {
                                            let postidlist = datacats.listdata;
                                            total = datacats.total;

                                            for (var i = 0; i < postidlist.length; i++) {
                                                if (postidlist[i].postID === body.postID) {
                                                    postidlist.splice(i, 1);
                                                }
                                            }
                                            let catCountDto_ = new InterestCountDto();
                                            catCountDto_.total = total - 1;
                                            catCountDto_.listdata = postidlist;
                                            await this.interestCountService.update(tagcat, catCountDto_);
                                        }
                                    }
                                }
                            }

                        } else {
                            body.cats = [];
                        }

                    }
                    data = await this.newPostContentService.updatePost(body, headers, dataUser);
                    //tags
                    if (body.tags !== undefined && body.tags.length > 0) {
                        var tag2 = body.tags;
                        for (let i = 0; i < tag2.length; i++) {
                            let id = tag2[i];
                            var datatag2 = null;

                            try {
                                datatag2 = await this.tagCountService.findOneById(id);

                            } catch (e) {
                                datatag2 = null;

                            }

                            if (datatag2 === null) {

                                let tagCountDto_ = new TagCountDto();
                                tagCountDto_._id = id;
                                tagCountDto_.total = 1;
                                tagCountDto_.listdata = [{ "postID": body.postID }];
                                await this.tagCountService.create(tagCountDto_);
                            } else {

                                var datatag3 = null;
                                var lengdata3 = null;

                                try {
                                    datatag3 = await this.tagCountService.finddatabypostid(id, body.postID);
                                    lengdata3 = datatag3.length;

                                } catch (e) {
                                    datatag3 = null;
                                    lengdata3 = 0;
                                }
                                var datapost = null;
                                var tagslast = [];
                                try {
                                    datapost = await this.newPostService.findByPostId(body.postID);
                                    tagslast = datapost.tags;
                                } catch (e) {
                                    datapost = null;
                                    tagslast = [];
                                }
                                let idnew = tagslast[i];
                                var total2 = 0;
                                var postidlist2 = [];
                                let obj = { "postID": body.postID };
                                total2 = datatag2.total;
                                postidlist2 = datatag2.listdata;
                                if (id === idnew) {
                                    if (lengdata3 == 0) {
                                        postidlist2.push(obj);
                                    }
                                }

                                let tagCountDto_ = new TagCountDto();
                                tagCountDto_._id = id;
                                if (id === idnew) {

                                    if (lengdata3 == 0) {
                                        tagCountDto_.total = total2 + 1;
                                    }
                                }

                                tagCountDto_.listdata = postidlist2;
                                await this.tagCountService.update(id, tagCountDto_);
                            }

                        }
                    } else {

                    }

                    //Interest
                    const mongoose = require('mongoose');
                    var ObjectId = require('mongodb').ObjectId;

                    if (body.cats !== undefined) {
                        let cats = body.cats;
                        var splitcats = cats.split(',');
                        for (let i = 0; i < splitcats.length; i++) {
                            let id = splitcats[i];
                            var datacats = null;
                            var datacatsday = null;

                            try {
                                datacats = await this.interestCountService.findOneById(id);

                            } catch (e) {
                                datacats = null;

                            }

                            if (datacats === null) {


                                let interestCountDto_ = new InterestCountDto();
                                interestCountDto_._id = mongoose.Types.ObjectId(id);
                                interestCountDto_.total = 1;
                                interestCountDto_.listdata = [{ "postID": body.postID }];
                                await this.interestCountService.create(interestCountDto_);


                            }
                            else {


                                var catslast = [];
                                var datapostawal = null;

                                try {
                                    datapostawal = await this.newPostService.findByPostId(body.postID);
                                    catslast = datapostawal.category;
                                } catch (e) {
                                    datapostawal = null;
                                    catslast = [];
                                }
                                let idnew = catslast[i].oid.toString();
                                var totalcats = 0;
                                var postidlistcats = [];
                                let obj = { "postID": datapostawal.postID };
                                totalcats = datacats.total;
                                postidlistcats = datacats.listdata;
                                if (id !== idnew) {
                                    postidlistcats.push(obj);
                                }

                                let interestCountDto_ = new InterestCountDto();
                                interestCountDto_._id = mongoose.Types.ObjectId(id);
                                if (id !== idnew) {
                                    interestCountDto_.total = totalcats + 1;
                                }
                                interestCountDto_.listdata = postidlistcats;
                                await this.interestCountService.update(id, interestCountDto_);
                            }

                            var dt = new Date(Date.now());
                            dt.setHours(dt.getHours() + 7); // timestamp
                            dt = new Date(dt);
                            var strdate = dt.toISOString();
                            var repdate = strdate.replace('T', ' ');
                            var splitdate = repdate.split('.');
                            var stringdate = splitdate[0];
                            var date = stringdate.substring(0, 10) + " " + "00:00:00";
                            var cekdata = null;

                            try {
                                cekdata = await this.interestdayService.finddate(date);

                            } catch (e) {
                                cekdata = null;

                            }

                            try {
                                datacatsday = await this.interestdayService.finddatabydate(date, id);

                            } catch (e) {
                                datacatsday = null;

                            }

                            if (cekdata.length == 0) {
                                let interestdayDto_ = new InterestdayDto();
                                interestdayDto_.date = date;
                                interestdayDto_.listinterest = [{
                                    "_id": mongoose.Types.ObjectId(id),
                                    "total": 1,
                                    "createdAt": stringdate,
                                    "updatedAt": stringdate
                                }];
                                await this.interestdayService.create(interestdayDto_);
                            } else {
                                if (datacatsday.length > 0) {
                                    var idq = datacatsday[0]._id;
                                    var idint = datacatsday[0].listinterest._id;
                                    var totalint = datacatsday[0].listinterest.total;
                                    await this.interestdayService.updatefilter(idq.toString(), idint.toString(), totalint + 1, stringdate);
                                } else {
                                    var idInt = cekdata[0]._id.toString();
                                    var list = cekdata[0].listinterest;
                                    var objin = {
                                        "_id": mongoose.Types.ObjectId(id),
                                        "total": 1,
                                        "createdAt": stringdate,
                                        "updatedAt": stringdate
                                    };
                                    list.push(objin);
                                    await this.interestdayService.updateInterestday(idInt, list);
                                }
                            }

                        }
                    }

                    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
                    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());
                    if (saleAmount > 0) {
                        await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
                        //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event, body.postID.toString(), posts.postType.toString());
                    }

                    var timestamps_end = await this.utilsService.getDateTimeString();
                    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);

                    return data;
                }
            }
        }
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postID', body.postID.toString());
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> postType', posts.postType.toString());

        if (saleAmount > 0) {
            if (posts.saleAmount != saleAmount) {
                await this.utilsService.sendFcmV2(email, email.toString(), "POST", "POST", "UPDATE_POST_SELL", body.postID.toString(), posts.postType.toString())
            }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, reqbody.email, null, null, reqbody);
        return data;
    }

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

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var strdate = dt.toISOString();
        var repdate = strdate.replace('T', ' ');
        var splitdate = repdate.split('.');
        var timestamps_end = splitdate[0];

        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, body.body);
        
        var ver = await this.settingsService.findOneByJenis('AppsVersion');
        ver.value;
        var version = String(ver.value);

        return {
            response_code: 202,
            data: data,
            version: version
        }
    }

    @Post('posts/postbychart/v2')
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

    @Get('posts/showsertifikasistatbychart/v2')
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
    @Post('getusercontents/database/v2')
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
    @Post('getusercontents/management/grouping/v2')
    @UseGuards(JwtAuthGuard)
    async contentmanagemen2v2(@Req() request: Request): Promise<any> {
        var fullurl = request.get("Host") + request.originalUrl;

        var timestamps_start = await this.utilsService.getDateTimeString();
        var data = null;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };
        data = await this.newPostService.detaildasborv2(email);

        var timestamps_end = await this.utilsService.getDateTimeString();

        var fullurl = request.get("Host") + request.originalUrl;
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
        return { response_code: 202, data, messages };
    }

    @Post('getusercontents/management/grouping/activitygraph/v2')
    @UseGuards(JwtAuthGuard)
    async contentmanagemengraphactivity(@Req() request: Request): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var data = null;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }


        const messages = {
            "info": ["The process successful"],
        };

        data = await this.newPostService.getactivitygraphv2(email);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('getusercontents/searchdatanew')
    @UseGuards(JwtAuthGuard)
    async contentsearchnew2(@Req() request: Request, @Headers() headers): Promise<any> {
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
        var listtag = null;

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
        listtag = request_json["listtag"];

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
        var tags = [];
        var lengpict = null;
        var lengdiary = null;
        var lengvid = null;
        var lenguser = null;
        var datatag = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var uploadSource = null;
        try {
            datasearch = await this.newPostService.finddatasearchcontenNewv2(keys.toLowerCase(), email, skip, limit, listpict, listvid, listdiary, listuser, listtag);
            user = datasearch[0].user;
            tags = datasearch[0].tags;

        } catch (e) {
            datasearch = null;
            user = [];
            tags = [];
        }

        if (tags == undefined || tags.length == 0 || tags[0].tag == undefined) {
            tags = [];
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

        var tempdatapict = [];
        var temporipict = [];
        // console.log(lengpict);
        if (lengpict > 0) {

            if (arrpict[0]._id !== undefined) {

                for (let i = 0; i < lengpict; i++) {
                    uploadSource = arrpict[i].uploadSource;
                    try {
                        apsaraId = arrpict[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = arrpict[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }

                    if (apsaraThumbId !== undefined) {
                        tempdatapict.push(arrpict[i].apsaraThumbId);

                    }
                    if (apsaraId !== undefined) {
                        temporipict.push(arrpict[i].apsaraId);

                    }

                }

                // console.log(tempdatapict);


                var resultpictapsara = await this.PostContentService.getImageApsara(tempdatapict);
                var gettempresultpictapsara = resultpictapsara.ImageInfo;
                var resultpictapsaraOri = await this.PostContentService.getImageApsara(temporipict);
                var gettempresultpictapsaraori = resultpictapsaraOri.ImageInfo;
                for (var i = 0; i < lengpict; i++) {
                    //var checkpictketemu = false;

                    uploadSource = arrpict[i].uploadSource;


                    if (uploadSource == "OSS") {
                        //arrpict[i].mediaThumbEndpoint = arrpict[i].mediaEndpoint;

                    } else {


                        if (gettempresultpictapsara.length > 0) {
                            for (let j = 0; j < gettempresultpictapsara.length; j++) {

                                if (gettempresultpictapsara[j].ImageId == arrpict[i].apsaraThumbId) {


                                    arrpict[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                                }

                            }
                        }

                        if (gettempresultpictapsaraori.length > 0) {
                            for (let j = 0; j < gettempresultpictapsaraori.length; j++) {


                                if (gettempresultpictapsaraori[j].ImageId == arrpict[i].apsaraId) {

                                    arrpict[i].mediaEndpoint = gettempresultpictapsaraori[j].URL;

                                }
                            }
                        }
                    }



                    picts.push(arrpict[i]);
                }
            } else {
                picts = [];
            }


        } else {
            picts = [];
        }

        var tempdatavid = [];
        // console.log(lengvid);
        if (lengvid > 0) {

            if (arrvid[0]._id !== undefined) {

                for (let i = 0; i < lengvid; i++) {
                    if (arrvid[i].isApsara == true) {
                        tempdatavid.push(arrvid[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultvidapsara = await this.PostContentService.getVideoApsara(tempdatavid);
                var gettempresultvidapsara = resultvidapsara.VideoList;
                for (var i = 0; i < lengvid; i++) {
                    var checkvidketemu = false;
                    for (var j = 0; j < gettempresultvidapsara.length; j++) {
                        if (gettempresultvidapsara[j].VideoId == arrvid[i].apsaraId) {
                            checkvidketemu = true;
                            arrvid[i].media =
                            {
                                "VideoList": [gettempresultvidapsara[j]]
                            }
                            arrvid[i].mediaThumbEndpoint = gettempresultvidapsara[j].CoverURL;
                        }
                    }

                    if (checkvidketemu == false) {
                        arrvid[i].apsaraId = "";
                        arrvid[i].isApsara = false;
                        arrvid[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    vid.push(arrvid[i]);
                }
            } else {
                vid = [];
            }


        } else {
            vid = [];
        }

        var tempdatadiary = [];
        // console.log(lengdiary);
        if (lengdiary > 0) {

            if (arrdiary[0]._id !== undefined) {

                for (let i = 0; i < lengdiary; i++) {
                    if (arrdiary[i].isApsara == true) {
                        tempdatadiary.push(arrdiary[i].apsaraId);
                    }
                }

                // console.log(tempdatavid);
                var resultdiaryapsara = await this.PostContentService.getVideoApsara(tempdatadiary);
                var gettempresultdiaryapsara = resultdiaryapsara.VideoList;
                for (var i = 0; i < lengdiary; i++) {
                    var checkdiaryketemu = false;
                    for (var j = 0; j < gettempresultdiaryapsara.length; j++) {
                        if (gettempresultdiaryapsara[j].VideoId == arrdiary[i].apsaraId) {
                            checkdiaryketemu = true;
                            arrdiary[i].media =
                            {
                                "VideoList": [gettempresultdiaryapsara[j]]
                            }
                            arrdiary[i].mediaThumbEndpoint = gettempresultdiaryapsara[j].CoverURL;
                        }
                    }

                    if (checkdiaryketemu == false) {
                        arrdiary[i].apsaraId = "";
                        arrdiary[i].isApsara = false;
                        arrdiary[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    diary.push(arrdiary[i]);
                }
            } else {
                diary = [];
            }


        } else {
            diary = [];
        }

        data = [{

            user, picts, vid, diary, tags
        }];

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    async scorepostrequest(iduser: string, idevent: string, namatabel: string, event: string, postID: string) {
        await this.contenteventsService.scorepostrequest(iduser, idevent, namatabel, event, postID);
    }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('post/viewlike/v2')
    async getViewLike(
        @Body() CreateGetcontenteventsDto_: GetcontenteventsDto,
        @Headers() headers
    ) {
        console.log(headers);
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
        const datapostsService = await this.newPostService.findid(
            CreateGetcontenteventsDto_.postID.toString(),
        );
        
        if (await this.utilsService.ceckData(datapostsService)) {
            CreateGetcontenteventsDto_.receiverParty = datapostsService.email;
            CreateGetcontenteventsDto_.active = true;
            CreateGetcontenteventsDto_.emailView = headers['x-auth-user'];
            var data_response = await this.newPostService.getUserEvent(CreateGetcontenteventsDto_);
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

    @Post('posts/getuserposts/my/v2')
    @UseInterceptors(FileInterceptor('postContent'))
    @UseGuards(JwtAuthGuard)
    async contentlandingpagemy(@Body() body, @Headers('x-auth-user') email: string): Promise<any> {
        console.log('=============================================MY PAGE HIT=============================================')
        console.log('============================================= BODY =============================================', JSON.stringify(body))

        var pageNumber = null;
        var pageRow = null;
        var postType = null;
        var data = null;
        var datasearch = null;
        var emailreceiver = null;
        if (body.pageNumber !== undefined) {
            pageNumber = body.pageNumber;
        }

        if (body.pageRow !== undefined) {
            pageRow = body.pageRow;
        }
        if (body.postType !== undefined) {
            postType = body.postType;
        }


        const messages = {
            "info": ["The process successful"],
        };

        var picts = [];
        var lengpict = null;

        try {

            data = await this.newPostService.landingpageMigration(email, email, postType, parseInt(pageNumber), parseInt(pageRow));
            lengpict = data.length;

        } catch (e) {
            console.log("ERROR", e);
            data = null;
            lengpict = 0;

        }

        console.log(data);

        var tempapsaraMusicThumbId = [];
        var tempapsaraId = [];
        var tempapsaraThumbId = [];
        var tempdatapict = [];

        var tempdatapict = [];

        var apsaraMusicThumbId = null;
        var boosted = null;
        var boostCount = null;
        var version = null;
        var uploadSource = null;
        var apsaraId = null;
        var apsaraThumbId = null;
        var mediaType = null;
        var postID = null;
        var gettempresultpictapsara = null;
        // console.log(lengpict);
        if (lengpict > 0) {
            var tempapsaraId_result = null;
            var tempapsaraThumbId_result = null; 
            var tempapsaraMusicThumbId_result = null;

            var resultpictapsara = null;
            version = data[0].version;
            // console.log(tempdatapict);
            if (postType == "pict") {
                for (let i = 0; i < lengpict; i++) {
                    uploadSource = data[i].uploadSource;
                    try {
                        apsaraId = data[i].apsaraId;
                    } catch (e) {
                        apsaraId = "";
                    }
                    try {
                        apsaraThumbId = data[i].apsaraThumbId;
                    } catch (e) {
                        apsaraThumbId = "";
                    }
                    try {
                        apsaraMusicThumbId = data[i].apsaraMusicThumnail;
                    } catch (e) {
                        apsaraMusicThumbId = "";
                    }

                    if (apsaraId != "") {
                        tempapsaraId.push(data[i].apsaraId);
                    }

                    if (apsaraId != "") {
                        tempapsaraThumbId.push(data[i].apsaraThumbId);
                    }

                    if (apsaraMusicThumbId != "") {
                        tempapsaraMusicThumbId.push(data[i].apsaraMusicThumnail);
                    }
                }
                console.log("");
                tempapsaraId_result = await this.newPostContentService.getImageApsara(tempapsaraId);
                tempapsaraThumbId_result = await this.newPostContentService.getImageApsara(tempapsaraThumbId);
                tempapsaraMusicThumbId_result = await this.newPostContentService.getImageApsara(tempapsaraMusicThumbId);

                let gettempresultpictapsara_tempapsaraId = tempapsaraId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraThumbId = tempapsaraThumbId_result.ImageInfo;
                let gettempresultpictapsara_tempapsaraMusicThumbId = tempapsaraMusicThumbId_result.ImageInfo;
                // for (let i = 0; i < lengpict; i++) {

                //     uploadSource = data[i].uploadSource;
                //     try {
                //         apsaraId = data[i].apsaraId;
                //     } catch (e) {
                //         apsaraId = "";
                //     }
                //     try {
                //         apsaraThumbId = data[i].apsaraThumbId;
                //     } catch (e) {
                //         apsaraThumbId = "";
                //     }

                //     if (apsaraId !== undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);
                //         // tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId !== undefined && apsaraThumbId === undefined) {
                //         tempdatapict.push(data[i].apsaraId);

                //     }
                //     else if (apsaraId === undefined && apsaraThumbId !== undefined) {
                //         tempdatapict.push(data[i].apsaraThumbId);

                //     }
                // }
                // resultpictapsara = await this.postContentService.getImageApsara(tempdatapict);
                // let gettempresultpictapsara = resultpictapsara.ImageInfo;
                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boosted = data[i].boosted;
                    boostCount = data[i].boostCount;
                    var checkpictketemu = false;
                    uploadSource = data[i].uploadSource;
                    var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    var dataUpsara = (data[i].apsaraId != undefined);

                    if (data[i].isApsara) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraId[j].ImageId == data[i].apsaraId) {
                                data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraId[j].URL;
                                }
                            }
                        }
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraThumbId[j].ImageId == data[i].apsaraThumbId) {
                                data[i].mediaThumbEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara_tempapsaraThumbId[j].URL;
                                }
                            }
                        }
                    }

                    if (data[i].apsaraMusicThumnail) {
                        for (var j = 0; j < gettempresultpictapsara_tempapsaraMusicThumbId.length; j++) {
                            if (gettempresultpictapsara_tempapsaraMusicThumbId[j].ImageId == data[i].apsaraMusicThumnail) {
                                data[i].mediaMusicThumbEndpoint = gettempresultpictapsara_tempapsaraMusicThumbId[j].URL;
                            }
                        }
                    }
                    // emailreceiver = data[i].email;
                    // boosted = data[i].boosted;
                    // boostCount = data[i].boostCount;
                    // var checkpictketemu = false;
                    // uploadSource = data[i].uploadSource;
                    // var dataUpsaraThum = (data[i].apsaraThumbId != undefined);
                    // var dataUpsara = (data[i].apsaraId != undefined);

                    // if (data[i].isApsara) {
                    //     for (var j = 0; j < gettempresultpictapsara.length; j++) {

                    //         if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsara) {
                    //                 data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             // checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                    //         }
                    //         else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                    //             if (data[i].apsaraThumbId == data[i].apsaraId) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             if (!dataUpsaraThum) {
                    //                 data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                    //             }
                    //             checkpictketemu = true;
                    //             data[i].media =
                    //             {
                    //                 "ImageInfo": [gettempresultpictapsara[j]]
                    //             }

                    //             data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                    //         }
                    //     }
                    // } else {
                    //     data[i].mediaThumbEndpoint = data[i].mediaEndpoint;
                    // }




                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.newPostService.updateBoostViewer(data[i].postID, email);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;
                                await this.newPostService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    //  this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);

                    picts.push(data[i]);
                }

            } else {
                for (let i = 0; i < lengpict; i++) {
                    //ini buat produksion
                    // postType = data[i].postType;
                    // if (postType === "diary") {
                    //     data[i].saleAmount = 0;
                    // }
                    mediaType = data[i].mediaType;


                    if (data[i].isApsara == true) {
                        tempdatapict.push(data[i].apsaraId);
                    } else {
                        if (mediaType == "image" || mediaType == "images") {
                            data[i].mediaEndpoint = "/pict/" + data[i].postID;
                        } else {
                            data[i].mediaEndpoint = "/stream/" + data[i].postID;

                        }
                    }
                }

                if (mediaType == "image" || mediaType == "images") {
                    resultpictapsara = await this.newPostContentService.getImageApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.ImageInfo;

                } else {
                    resultpictapsara = await this.newPostContentService.getVideoApsara(tempdatapict);
                    gettempresultpictapsara = resultpictapsara.VideoList;
                }

                for (let i = 0; i < lengpict; i++) {
                    emailreceiver = data[i].email;
                    boostCount = data[i].boostCount;
                    boosted = data[i].boosted;
                    var checkpictketemu = false;
                    for (var j = 0; j < gettempresultpictapsara.length; j++) {
                        if (mediaType == "image" || mediaType == "images") {
                            if (gettempresultpictapsara[j].ImageId == data[i].apsaraThumbId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsara) {
                                    data[i].mediaEndpoint = gettempresultpictapsara[j].URL;
                                }
                                // checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;



                            }
                            else if (gettempresultpictapsara[j].ImageId == data[i].apsaraId) {
                                if (data[i].apsaraThumbId == data[i].apsaraId) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                if (!dataUpsaraThum) {
                                    data[i].mediaThumbEndpoint = gettempresultpictapsara[j].URL;
                                }
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "ImageInfo": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaEndpoint = gettempresultpictapsara[j].URL;

                            }
                        } else {
                            if (gettempresultpictapsara[j].VideoId == data[i].apsaraId) {
                                checkpictketemu = true;
                                data[i].media =
                                {
                                    "VideoList": [gettempresultpictapsara[j]]
                                }

                                data[i].mediaThumbEndpoint = gettempresultpictapsara[j].CoverURL;
                            }
                        }
                    }

                    if (checkpictketemu == false) {
                        data[i].apsaraId = "";
                        data[i].isApsara = false;
                        data[i].media =
                        {
                            "VideoList": []
                        };
                    }
                    if (boosted !== null || boosted.length > 0) {
                        console.log("boosted: " + data[i].postID);
                        if (data[i].postID != undefined) {
                            this.newPostService.updateBoostViewer(data[i].postID, email);
                        }
                        //pd.boostJangkauan = this.countBoosted(obj, email);
                        if (boosted.length > 0) {
                            if (boosted[0] != undefined) {
                                boostCount = (boosted[0].boostViewer != undefined) ? boosted[0].boostViewer.length : 0;
                                boosted = boosted;

                                await this.newPostService.updateBoostCount(data[i].postID, boostCount + 1);
                            } else {
                                boostCount = 0;
                                boosted = [];
                            }
                        } else {
                            boostCount = 0;
                            boosted = [];
                        }
                    } else {
                        boostCount = 0;
                        boosted = [];
                    }
                    // this.PostBoostService.markViewedNew(data[i].postID, email, emailreceiver);


                    picts.push(data[i]);
                }
            }
        } else {
            picts = [];
            version = "";
        }
        return { response_code: 202, data: picts, version: version.toString(), version_ios: (await this.utilsService.getSetting_("645da79c295b0000520048c2")).toString(), messages };
    }
}
