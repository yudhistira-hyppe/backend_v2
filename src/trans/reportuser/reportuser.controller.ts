import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Headers, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ReportuserService } from './reportuser.service';
import { CreateReportsuserDto, DetailReport } from './dto/create-reportuser.dto';
import { Reportuser } from './schemas/reportuser.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ReportreasonsService } from '../reportreasons/reportreasons.service';
import { RemovedreasonsService } from '../removedreasons/removedreasons.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { PostsService } from '../../content/posts/posts.service';
import { AdsService } from '../ads/ads.service';
import { CreateAdsDto } from '../ads/dto/create-ads.dto';
import { CreatePostsDto } from 'src/content/posts/dto/create-posts.dto';
import { CreateUserbasicDto } from '../userbasics/dto/create-userbasic.dto';
import { PostContentService } from '../../content/posts/postcontent.service';
@Controller('api/reportuser')
export class ReportuserController {

    constructor(private readonly reportuserService: ReportuserService,
        private readonly reportreasonsService: ReportreasonsService,
        private readonly removedreasonsService: RemovedreasonsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
        private readonly adsService: AdsService) { }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.reportuserService.findAll();

        return { response_code: 202, data, messages };
    }


    // @UseGuards(JwtAuthGuard)
    // @Post()
    // async create(@Res() res, @Headers() headers, @Body() CreateReportsuserDto: CreateReportsuserDto, @Request() request) {
    //     var userid = null;
    //     const messages = {
    //         "info": ["The create successful"],
    //     };

    //     const messagesEror = {
    //         "info": ["Todo is not found!"],
    //     };
    //     if (headers['x-auth-token'] == undefined) {
    //         throw new BadRequestException("Unabled to proceed email is required");
    //     }
    //     try {
    //         const datauserbasicsService = await this.userbasicsService.findOne(
    //             headers['x-auth-user'],
    //         );
    //         userid = datauserbasicsService._id;
    //     } catch (e) {
    //         throw new BadRequestException("Unabled to proceed email is required");
    //     }

    //     var type = null;
    //     var reportTypeId = null;
    //     var cekdata = null;
    //     var cektypeid = null;
    //     var iduser = null;
    //     var reportReasonId = null;
    //     var detail = [];
    //     var objdetail = {};
    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     // var idadmin = mongoose.Types.ObjectId(iduseradmin);
    //     var dt = new Date(Date.now());
    //     dt.setHours(dt.getHours() + 7); // timestamp
    //     dt = new Date(dt);
    //     var detailreport = CreateReportsuserDto.detailReport;
    //     var lenghtdetail = detailreport.length;

    //     for (var i = 0; i < lenghtdetail; i++) {
    //         iduser = mongoose.Types.ObjectId(detailreport[i].userId);
    //         reportReasonId = mongoose.Types.ObjectId(detailreport[i].reportReasonId);

    //         let detailrpt = new DetailReport();
    //         detailrpt.userId = iduser;
    //         detailrpt.reportReasonId = reportReasonId;
    //         detailrpt.createdAt = dt.toISOString();
    //         detail.push(detailrpt);
    //     }
    //     try {
    //         type = CreateReportsuserDto.type;
    //     } catch (e) {
    //         type = "";
    //     }
    //     try {
    //         reportTypeId = CreateReportsuserDto.reportTypeId;
    //     } catch (e) {
    //         reportTypeId = "";
    //     }


    //     if (type === "post") {

    //         cekdata = await this.postsService.findOnepostID(reportTypeId);
    //     }
    //     else if (type === "account") {

    //         cekdata = await this.userbasicsService.findid(reportTypeId);
    //     }
    //     else if (type === "ads") {

    //         cekdata = await this.adsService.findOne(reportTypeId);
    //     }

    //     if (cekdata === null) {
    //         throw new BadRequestException("reportTypeId not found...!");
    //     } else {
    //         cektypeid = await this.reportuserService.findType(reportTypeId);

    //         if (cektypeid === null) {

    //             try {
    //                 CreateReportsuserDto.createdAt = dt.toISOString();
    //                 CreateReportsuserDto.detailReport = detail;
    //                 let data = await this.reportuserService.create(CreateReportsuserDto);

    //                 res.status(HttpStatus.OK).json({
    //                     response_code: 202,
    //                     "data": data,
    //                     "message": messages
    //                 });
    //             } catch (e) {
    //                 res.status(HttpStatus.BAD_REQUEST).json({

    //                     "message": messagesEror + "" + e
    //                 });
    //             }
    //         } else {
    //             var isremoved = cektypeid._doc.isRemoved;
    //             var id = cektypeid._id;

    //             if (isremoved === false) {
    //                 try {
    //                     CreateReportsuserDto.createdAt = dt.toISOString();
    //                     CreateReportsuserDto.detailReport = detail;
    //                     let data = await this.reportuserService.create(CreateReportsuserDto);

    //                     res.status(HttpStatus.OK).json({
    //                         response_code: 202,
    //                         "data": data,
    //                         "message": messages
    //                     });
    //                 } catch (e) {
    //                     res.status(HttpStatus.BAD_REQUEST).json({

    //                         "message": messagesEror + "" + e
    //                     });
    //                 }
    //             } else {
    //                 try {

    //                     let data = await this.reportuserService.updateid(id, userid, dt.toISOString());

    //                     res.status(HttpStatus.OK).json({
    //                         response_code: 202,
    //                         "message": "Update is success"
    //                     });
    //                 } catch (e) {
    //                     res.status(HttpStatus.BAD_REQUEST).json({

    //                         "message": messagesEror + "" + e
    //                     });
    //                 }
    //             }
    //         }
    //     }





    // }

    @UseGuards(JwtAuthGuard)
    @Post('create')
    async report(@Req() request) {
        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;
        var description = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        reportedUser = request_json["reportedUser"];
        //reportedUserHandle = request_json["reportedUserHandle"];
        contentModeration = request_json["contentModeration"];
        contentModerationResponse = request_json["contentModerationResponse"];
        description = request_json["description"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }


        if (type === "content") {
            let createPostsDto = new CreatePostsDto();
            try {
                datacontent = await this.postsService.findByPostId(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {

                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        arrayreportedUser.push(objreportuser);
                    }
                } else {

                }





                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createPostsDto.reportedStatus = reportedStatus;
                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = lenguserreport;
                    if (arrayreportedUser.length > 0) {
                        createPostsDto.reportedUser = arrayreportedUser;
                    } else {

                    }

                    this.postsService.update(postID, createPostsDto);
                } else {
                    createPostsDto.reportedStatus = reportedStatus;
                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (arrayreportedUser.length > 0) {
                        createPostsDto.reportedUser = arrayreportedUser;
                    } else {

                    }

                    this.postsService.update(postID, createPostsDto);
                }

                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();

            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {
                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }



                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        arrayreportedUser.push(objreportuser);
                    }
                } else {

                }




                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createAdsDto.reportedStatus = reportedStatus;
                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = lenguserreport;

                    if (arrayreportedUser.length > 0) {
                        createAdsDto.reportedUser = arrayreportedUser;
                    } else {

                    }
                    this.adsService.update(postID, createAdsDto);
                } else {
                    createAdsDto.reportedStatus = reportedStatus;
                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (arrayreportedUser.length > 0) {
                        createAdsDto.reportedUser = arrayreportedUser;
                    } else {

                    }

                    this.adsService.update(postID, createAdsDto);
                }

                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateUserbasicDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.userbasicsService.findbyid(postID);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {
                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {

                        let iduser = reportedUser[i].userID;
                        let email = reportedUser[i].email;
                        let idreason = reportedUser[i].reportReasonId;
                        let userid = mongoose.Types.ObjectId(iduser);
                        let reportReasonId = mongoose.Types.ObjectId(idreason);
                        objreportuser = {
                            "userID": userid,
                            "email": email,
                            "reportReasonId": reportReasonId,
                            "createdAt": dt.toISOString(),
                            "active": true,
                            "description": description,
                            "updatedAt": dt.toISOString(),
                        };
                        arrayreportedUser.push(objreportuser);
                    }
                } else {

                }


                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = lenguserreport;

                    if (arrayreportedUser.length > 0) {
                        createUserbasicDto.reportedUser = arrayreportedUser;
                    } else {

                    }

                    this.userbasicsService.update(postID, createUserbasicDto);
                } else {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (arrayreportedUser.length > 0) {
                        createUserbasicDto.reportedUser = arrayreportedUser;
                    } else {

                    }
                    this.userbasicsService.update(postID, createUserbasicDto);
                }

                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }

    @UseGuards(JwtAuthGuard)
    @Post('appeal')
    async reportHandle(@Req() request) {
        var reportedStatus = null;
        var reportedUserHandle = [];
        var postID = null;
        var data = null;
        var reportedUserCount = null;
        var lenguserreport = null
        var lengreporthandle = null
        var reportedUser = [];
        var dataauth = null;
        var arrayreportedUser = [];
        var arrayreportedHandle = [];
        var contentModeration = null;
        var contentModerationResponse = null;
        var datacontent = null;
        var objreportuser = {};
        var objreporthandle = {};
        var type = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        reportedStatus = request_json["reportedStatus"];

        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        reportedUserHandle = request_json["reportedUserHandle"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        try {
            lenguserreport = reportedUser.length;
        } catch (e) {
            lenguserreport = 0;
        }

        try {
            lengreporthandle = reportedUserHandle.length;
        } catch (e) {
            lengreporthandle = 0;
        }

        if (type === "content") {
            let createPostsDto = new CreatePostsDto();
            try {
                datacontent = await this.postsService.findByPostId(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {


                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {

                            "type": typeAppeal,
                            "remark": remark,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createPostsDto.reportedStatus = reportedStatus;
                if (arrayreportedHandle.length > 0) {
                    createPostsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.postsService.update(postID, createPostsDto);


                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("postID is not found...!");
            }
        }
        else if (type === "ads") {


            let createAdsDto = new CreateAdsDto();

            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.adsService.findOne(postID);


            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {


                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {

                            "type": typeAppeal,
                            "remark": remark,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }

                if (arrayreportedHandle.length > 0) {
                    createAdsDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.adsService.update(postID, createAdsDto);
                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("Ads ID is not found...!");
            }
        }
        else if (type === "user") {
            let createUserbasicDto = new CreateUserbasicDto();
            let postid = mongoose.Types.ObjectId(postID);
            try {
                datacontent = await this.userbasicsService.findbyid(postID);
                console.log(datacontent)

            } catch (e) {
                datacontent = null;
            }

            if (datacontent !== null) {


                if (lengreporthandle > 0) {
                    for (let i = 0; i < lengreporthandle; i++) {

                        let status = reportedUserHandle[i].status;
                        let remark = reportedUserHandle[i].remark;
                        let typeAppeal = reportedUserHandle[i].typeAppeal;
                        objreporthandle = {

                            "type": typeAppeal,
                            "remark": remark,
                            "createdAt": dt.toISOString(),
                            "updatedAt": dt.toISOString(),
                            "status": status
                        };
                        arrayreportedHandle.push(objreporthandle);
                    }
                } else {

                }


                createUserbasicDto.reportedStatus = reportedStatus;


                if (arrayreportedHandle.length > 0) {
                    createUserbasicDto.reportedUserHandle = arrayreportedHandle;
                } else {

                }
                this.userbasicsService.update(postID, createUserbasicDto);


                var data = request_json;
                return { response_code: 202, data, messages };


            } else {
                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }

    @UseGuards(JwtAuthGuard)
    @Post('listreport')
    async finddata(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var key = null;
        var page = null;
        var type = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var iduser = null;
        var totalpage = null;
        var postType = null;
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
        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        postType = request_json["postType"];
        key = request_json["key"];

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        if (type === "content") {


            let query = await this.postsService.findreport(key, postType, startdate, enddate, page, limit);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].apsaraId;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[i].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[i].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "pict") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "vid") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }
                    else if (type === "story") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "diary") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
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
                objk = {
                    "_id": query[i]._id,
                    "mediaType": query[i].mediaType,
                    "mediaThumbEndpoint": query[i].mediaThumbEndpoint,
                    "mediaEndpoint": query[i].mediaEndpoint,
                    "idmedia": query[i].idmedia,
                    "createdAt": query[i].createdAt,
                    "updatedAt": query[i].updatedAt,
                    "postID": query[i].postID,
                    "email": query[i].email,
                    "postType": query[i].postType,
                    "description": query[i].description,
                    "title": query[i].title,
                    "active": query[i].active,
                    "contentModeration": query[i].contentModeration,
                    "contentModerationResponse": query[i].contentModerationResponse,
                    "reportedStatus": query[i].reportedStatus,
                    "reportedUserCount": query[i].reportedUserCount,
                    "reportedUser": query[i].reportedUser,
                    "reportReasonIdLast": query[i].reportReasonIdLast,
                    "reasonLast": query[i].reasonLast,
                    "createdAtReportLast": query[i].createdAtReportLast,
                    "reportStatusLast": query[i].reportStatusLast,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "media": data
                };

                arrdata.push(objk);
            }

            let datasearch = await this.postsService.findreportcount(key, postType, startdate, enddate,);
            var totalsearch = datasearch.length;

            var tpage = null;
            var tpage2 = null;

            tpage2 = (totalsearch / limit).toFixed(0);
            tpage = (totalsearch % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }

            return { response_code: 202, arrdata, page, limit, totalsearch, totalpage, messages };
        }

        else if (type === "ads") {


            let query = await this.adsService.findreportads(key, postType, startdate, enddate, page, limit);
            var data = null;
            var arrdata = [];
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            for (var i = 0; i < query.length; i++) {
                try {
                    idapsara = query[i].idApsara;
                } catch (e) {
                    idapsara = "";
                }

                var type = query[i].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image") {

                        try {
                            data = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            data = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            data = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            data = [];
                        }

                    }

                }



                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";
                    apsaradefine = false
                } else {
                    idapsaradefine = idapsara;
                    apsaradefine = true
                }
                objk = {
                    "_id": query[i]._id,
                    "userID": query[i].userID,
                    "idApsara": query[i].idApsara,
                    "name": query[i].name,
                    "status": query[i].status,
                    "timestamp": query[i].timestamp,
                    "totalUsedCredit": query[i].totalUsedCredit,
                    "tayang": query[i].tayang,
                    "usedCredit": query[i].usedCredit,
                    "usedCreditFree": query[i].usedCreditFree,
                    "creditFree": query[i].creditFree,
                    "creditValue": query[i].creditValue,
                    "totalCredit": query[i].totalCredit,
                    "tipeads": query[i].tipeads,
                    "contentModeration": query[i].contentModeration,
                    "contentModerationResponse": query[i].contentModerationResponse,
                    "reportedStatus": query[i].reportedStatus,
                    "reportedUserCount": query[i].reportedUserCount,
                    "reportedUser": query[i].reportedUser,
                    "reportReasonIdLast": query[i].reportReasonIdLast,
                    "reasonLast": query[i].reasonLast,
                    "createdAtReportLast": query[i].createdAtReportLast,
                    "place": query[i].place,
                    "reportStatusLast": query[i].reportStatusLast,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "media": data
                };

                arrdata.push(objk);
            }

            let datasearch = await this.adsService.findreportadscount(key, postType, startdate, enddate,);
            var totalsearch = datasearch.length;

            var tpage = null;
            var tpage2 = null;

            tpage2 = (totalsearch / limit).toFixed(0);
            tpage = (totalsearch % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }

            return { response_code: 202, arrdata, page, limit, totalsearch, totalpage, messages };
        }
    }
}
