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
import { TransactionsService } from '../transactions/transactions.service';
import { UserauthsService } from '../userauths/userauths.service';
import { UserAdsService } from '../userads/userads.service';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
@Controller('api/reportuser')
export class ReportuserController {

    constructor(private readonly reportuserService: ReportuserService,
        private readonly reportreasonsService: ReportreasonsService,
        private readonly removedreasonsService: RemovedreasonsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly postsService: PostsService,
        private readonly postContentService: PostContentService,
        private readonly adsService: AdsService,
        private readonly transactionsService: TransactionsService,
        private readonly userauthsService: UserauthsService,
        private readonly userAdsService: UserAdsService,
        private readonly mediaprofilepictsService: MediaprofilepictsService
    ) { }
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

                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }


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
                        let description = reportedUser[i].description;
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
                        reportedUserNew.push(objreportuser);

                    }
                } else {

                }





                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createPostsDto.reportedStatus = reportedStatus;
                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = lenguserreport;
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    this.postsService.update(postID, createPostsDto);
                } else {
                    createPostsDto.reportedStatus = reportedStatus;
                    createPostsDto.contentModeration = contentModeration;
                    createPostsDto.contentModerationResponse = contentModerationResponse;
                    createPostsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createPostsDto.reportedUser = reportedUserNew;
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

                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }

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
                        let description = reportedUser[i].description;
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
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }




                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createAdsDto.reportedStatus = reportedStatus;
                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
                    } else {

                    }
                    this.adsService.update(postID, createAdsDto);
                } else {
                    createAdsDto.reportedStatus = reportedStatus;
                    createAdsDto.contentModeration = contentModeration;
                    createAdsDto.contentModerationResponse = contentModerationResponse;
                    createAdsDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createAdsDto.reportedUser = reportedUserNew;
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
                var reportedUserNew = [];
                try {
                    reportedUserNew = datacontent.reportedUser;
                } catch (e) {
                    reportedUserNew = [];
                }
                try {
                    reportedUserCount = datacontent._doc.reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }
                if (lenguserreport > 0) {
                    for (let i = 0; i < lenguserreport; i++) {
                        let description = reportedUser[i].description;
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
                        reportedUserNew.push(objreportuser);
                    }
                } else {

                }


                if (reportedUserCount === 0 || reportedUserCount === undefined) {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = lenguserreport;

                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
                    } else {

                    }

                    this.userbasicsService.update(postID, createUserbasicDto);
                } else {
                    createUserbasicDto.reportedStatus = reportedStatus;
                    createUserbasicDto.reportedUserCount = parseInt(reportedUserCount) + parseInt(lenguserreport);
                    if (reportedUserNew.length > 0) {
                        createUserbasicDto.reportedUser = reportedUserNew;
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
        var datahandel = null;
        var objhandel = {};
        var reportedHandel = null;

        var reportCount = null;

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

                try {
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                if (reportCount >= 200) {
                    throw new BadRequestException("Appeal tidak bisa diajukan...!");
                } else {
                    if (lengreporthandle > 0) {
                        for (let i = 0; i < lengreporthandle; i++) {

                            let status = reportedUserHandle[i].status;
                            let remark = reportedUserHandle[i].remark;
                            let reason = reportedUserHandle[i].reason;
                            // let typeAppeal = reportedUserHandle[i].typeAppeal;
                            objreporthandle = {


                                "reason": reason,
                                "remark": remark,
                                "reasonAdmin": "",
                                "reasonId": null,
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

                }


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
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                if (reportCount >= 200) {
                    throw new BadRequestException("Appeal tidak bisa diajukan...!");
                }
                else {
                    if (lengreporthandle > 0) {
                        for (let i = 0; i < lengreporthandle; i++) {

                            let status = reportedUserHandle[i].status;
                            let remark = reportedUserHandle[i].remark;
                            let reason = reportedUserHandle[i].reason;
                            // let typeAppeal = reportedUserHandle[i].typeAppeal;
                            objreporthandle = {


                                "reason": reason,
                                "remark": remark,
                                "reasonAdmin": "",
                                "reasonId": null,
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

                }
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
                    reportCount = datacontent.reportedUserCount;
                } catch (e) {
                    reportCount = 0;
                }

                try {

                    datahandel = datacontent.reportedUserHandle;

                } catch (e) {
                    datahandel = null;
                }

                if (datahandel.length > 0) {
                    for (let i = 0; i < datahandel.length; i++) {
                        let status = datahandel[i].status;

                        if (status === "BARU") {
                            throw new BadRequestException("Appeal sudah diajukan...!");
                        }
                    }

                }

                if (reportCount >= 200) {
                    throw new BadRequestException("Appeal tidak bisa diajukan...!");
                }
                else {
                    if (lengreporthandle > 0) {
                        for (let i = 0; i < lengreporthandle; i++) {

                            let status = reportedUserHandle[i].status;
                            let remark = reportedUserHandle[i].remark;
                            let reason = reportedUserHandle[i].reason;
                            // let typeAppeal = reportedUserHandle[i].typeAppeal;
                            objreporthandle = {

                                "reason": reason,
                                "remark": remark,
                                "reasonAdmin": "",
                                "reasonId": null,
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
                }


            } else {
                throw new BadRequestException("User ID is not found...!");
            }
        }


        //deletetagpeople


    }


    @UseGuards(JwtAuthGuard)
    @Post('approval')
    async reportHandleAproval(@Req() request) {
        var postID = null;

        var type = null;
        var ditangguhkan = null;
        var reason = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

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

        if (request_json["ditangguhkan"] !== undefined) {
            ditangguhkan = request_json["ditangguhkan"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        reason = request_json["reason"];
        reasonId = request_json["reasonId"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idreason = mongoose.Types.ObjectId(reasonId);
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };



        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];


        if (type === "content") {
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            if (ditangguhkan === true) {
                if (reportedUserHandle.length > 0) {
                    await this.postsService.updateDitangguhkan(postID, reason, dt.toISOString(), idreason);
                } else {

                    objreporthandle = {

                        "reasonId": reasonId,
                        "reasonAdmin": reason,
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.postsService.updateDitangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
                }


            } else {
                if (reportedUserHandle.length > 0) {
                    await this.postsService.updateTidakditangguhkan(postID, dt.toISOString());
                    await this.postsService.nonactive(postID, dt.toISOString());
                } else {
                    objreporthandle = {

                        "reasonId": null,
                        "reasonAdmin": "",
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "TIDAK DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.postsService.updateTidakditangguhkanEmpty(postID, dt.toISOString(), arrayreportedHandle);
                    await this.postsService.nonactive(postID, dt.toISOString());
                }
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (ditangguhkan === true) {

                if (reportedUserHandle.length > 0) {
                    await this.adsService.updateDitangguhkan(adsId, reason, dt.toISOString(), idreason);
                } else {

                    objreporthandle = {

                        "reasonId": reasonId,
                        "reasonAdmin": reason,
                        "reason": "",
                        "remark": "",
                        "createdAt": dt.toISOString(),
                        "updatedAt": dt.toISOString(),
                        "status": "DITANGGUHKAN"
                    };
                    arrayreportedHandle.push(objreporthandle);

                    await this.adsService.updateDitangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                }

            } else {
                objreporthandle = {
                    "reasonId": null,
                    "reasonAdmin": "",
                    "reason": "",
                    "remark": "",
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "TIDAK DITANGGUHKAN"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateTidakditangguhkanEmpty(adsId, dt.toISOString(), arrayreportedHandle);
                await this.adsService.nonactive(adsId, dt.toISOString());

            }
        }

        return { response_code: 202, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('flaging')
    async reportHandleFlaging(@Req() request) {

        var postID = null;

        var type = null;
        var reason = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

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

        reasonId = request_json["reasonId"];


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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.postsService.updateFlaging(postID, dt.toISOString());

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.postsService.updateFlagingEmpty(postID, dt.toISOString(), arrayreportedHandle);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.adsService.updateFlaging(adsId, dt.toISOString());

            } else {

                objreporthandle = {

                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "FLAGING"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateFlagingEmpty(adsId, dt.toISOString(), arrayreportedHandle);
            }


        }

        return { response_code: 202, messages };
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
        var totalallrow = null;
        var datasearch = null;
        var totalsearch = null;
        var total = null;
        var startreport = null;
        var endreport = null;
        var status = null;
        var reason = null;
        var descending = null;
        var reasonAppeal = null;
        var username = null;
        var jenis = null;
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
        if (request_json["jenis"] !== undefined) {
            jenis = request_json["jenis"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        postType = request_json["postType"];
        key = request_json["key"];

        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        startreport = request_json["startreport"];
        endreport = request_json["endreport"];
        status = request_json["status"];
        reason = request_json["reason"];
        descending = request_json["descending"];
        reasonAppeal = request_json["reasonAppeal"];
        username = request_json["username"];
        if (type === "content") {


            let query = await this.postsService.findreport(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
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
                    "fullName": query[i].fullName,
                    "username": query[i].username,
                    "postType": query[i].postType,
                    "description": query[i].description,
                    "title": query[i].title,
                    "active": query[i].active,
                    "contentModeration": query[i].contentModeration,
                    "contentModerationResponse": query[i].contentModerationResponse,
                    "reportedStatus": query[i].reportedStatus,
                    "reportedUserCount": query[i].reportedUserCount,
                    "reportedUser": query[i].reportedUser,
                    "reportedUserHandle": query[i].reportedUserHandle,
                    "reportReasonIdLast": query[i].reportReasonIdLast,
                    "reasonLast": query[i].reasonLast,
                    "createdAtReportLast": query[i].createdAtReportLast,
                    "createdAtAppealLast": query[i].createdAtAppealLast,
                    "reportStatusLast": query[i].reportStatusLast,
                    "reasonLastAppeal": query[i].reasonLastAppeal,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "avatar": query[i].avatar,
                    "media": data
                };

                arrdata.push(objk);
            }

            total = query.length;
            let datasearch = await this.postsService.findreport(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
            totalsearch = datasearch.length;

            let dataall = await this.postsService.findreport(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
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


        }

        else if (type === "ads") {


            let query = await this.adsService.findreportads(key, postType, startdate, enddate, page, limit, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
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
                    "email": query[i].email,
                    "fullName": query[i].fullName,
                    "username": query[i].username,
                    "idApsara": query[i].idApsara,
                    "name": query[i].name,
                    "nameType": query[i].nameType,
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
                    "reportedUserHandle": query[i].reportedUserHandle,
                    "reportReasonIdLast": query[i].reportReasonIdLast,
                    "reasonLast": query[i].reasonLast,
                    "createdAtReportLast": query[i].createdAtReportLast,
                    "createdAtAppealLast": query[i].createdAtAppealLast,
                    "place": query[i].place,
                    "reportStatusLast": query[i].reportStatusLast,
                    "reasonLastAppeal": query[i].reasonLastAppeal,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "avatar": query[i].avatar,
                    "media": data
                };

                arrdata.push(objk);
            }
            total = query.length;
            let datasearch = await this.adsService.findreportads(key, postType, startdate, enddate, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
            totalsearch = datasearch.length;
            let dataall = await this.adsService.findreportads(undefined, undefined, undefined, undefined, 0, 0, startreport, endreport, status, reason, descending, reasonAppeal, username, jenis);
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


        }
        return { response_code: 202, arrdata, page, limit, total, totalallrow, totalsearch, totalpage, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('listdetail')
    async finddetail(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;
        var totalReport = null;

        var reportedUserCount = null;
        if (type === "content") {
            var email = null;
            var tagPeople = [];
            var tagpeoples = [];
            var lengUser = null;
            try {
                query = await this.postsService.findreportuserdetail(postID);
                lengUser = query.length;
            } catch (e) {
                query = null;
                lengUser = 0;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var objauth = {};
            var dataauth = null;
            var idusersell = null;
            var tgltransaksi = null;
            var namapenjual = null;

            let dataapsara = null;


            if (lengUser > 0) {
                email = query[0].email;
                tagPeople = query[0].tagPeople;
                try {
                    reportedUserCount = query[0].reportedUserCount;
                    totalReport = reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                    totalReport = 0;
                }

                if (tagPeople !== undefined) {

                    for (let i = 0; i < tagPeople.length; i++) {
                        var idauth = tagPeople[i].oid;

                        dataauth = await this.userauthsService.findOneId(idauth);
                        console.log(dataauth);

                        objauth = {
                            username: dataauth._doc.username
                        }
                        tagpeoples.push(objauth);
                    }

                } else {
                    tagpeoples = [];
                }

                var ubasicpembeli = await this.userbasicsService.findOne(email);
                var iduserbuyer = mongoose.Types.ObjectId(ubasicpembeli._id);
                var namapembeli = ubasicpembeli.fullName;

                var datatransaksi = await this.transactionsService.findpostidanduser(query[0].postID, iduserbuyer);

                if (datatransaksi === null || datatransaksi === undefined) {
                    namapenjual = "";
                    tgltransaksi = "";
                } else {
                    idusersell = datatransaksi.idusersell;
                    tgltransaksi = datatransaksi.timestamp;

                    var ubasicpenjual = await this.userbasicsService.findbyid(idusersell.toString());
                    namapenjual = ubasicpenjual.fullName;

                }


                try {
                    idapsara = query[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = [];
                }
                else {
                    if (type === "pict") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = [];
                        }
                    }
                    else if (type === "vid") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = [];
                        }

                    }
                    else if (type === "story") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = [];
                        }
                    }
                    else if (type === "diary") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = [];
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
                    "_id": query[0]._id,
                    "postID": query[0].postID,
                    "email": query[0].email,
                    "postType": query[0].postType,
                    "description": query[0].description,
                    "active": query[0].active,
                    "createdAt": query[0].createdAt,
                    "updatedAt": query[0].updatedAt,
                    "visibility": query[0].visibility,
                    "location": query[0].location,
                    "tags": query[0].tags,
                    "allowComments": query[0].allowComments,
                    "isSafe": query[0].isSafe,
                    "isOwned": query[0].isOwned,
                    "saleLike": query[0].saleLike,
                    "saleView": query[0].saleView,
                    "metadata": query[0].metadata,
                    "likes": query[0].likes,
                    "views": query[0].views,
                    "shares": query[0].shares,
                    "comments": query[0].comments,
                    "tagPeople": query[0].tagPeople,
                    "proofpict": query[0].proofpict,
                    "insight": query[0].insight,
                    "avatar": query[0].avatar,
                    "fullName": query[0].fullName,
                    "username": query[0].username,
                    "privacy": query[0].privacy,
                    "isIdVerified": query[0].isIdVerified,
                    "statusUser": query[0].statusUser,
                    "isViewed": query[0].isViewed,
                    "monetize": query[0].monetize,
                    "saleAmount": query[0].saleAmount,
                    "mediaref": query[0].mediaref,
                    "mediaType": query[0].mediaType,
                    "mediaThumbEndpoint": query[0].mediaThumbEndpoint,
                    "mediaEndpoint": query[0].mediaEndpoint,
                    "namapenjual": namapenjual,
                    "pemiliksekarang": namapembeli,
                    "tgltransaksi": tgltransaksi,
                    "reportedStatus": query[0].reportedStatus,
                    "reportStatusLast": query[0].reportStatusLast,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "reasonLastReport": query[0].reasonLastReport,
                    "tagpeople": tagpeoples,
                    "apsaraId": idapsaradefine,
                    "apsara": apsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.postsService.countReason(postID);
            } catch (e) {
                datacount = null;
            }

            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            return { response_code: 202, totalReport, dataSum, data, messages };
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);
            try {
                query = await this.adsService.detailadsreport(adsId);
            } catch (e) {
                query = null;
            }
            let pict: String[] = [];
            var objk = {};
            var type = null;
            var idapsara = null;
            var apsara = null;
            var idapsaradefine = null;
            var apsaradefine = null;
            var dataapsara = null;
            var dtcounview = null;
            var dtcountclick = null;
            var tView = null;
            var tClick = null;



            if (query !== null) {

                try {
                    dtcounview = await this.userAdsService.countViewads(adsId);
                    tView = dtcounview[0].totalView;
                } catch (e) {
                    dtcounview = null;
                    tView = 0;
                }
                try {
                    dtcountclick = await this.userAdsService.countKlikads(adsId);
                    tClick = dtcountclick[0].totalClick;
                } catch (e) {
                    dtcountclick = null;
                    tClick = 0;
                }

                try {
                    reportedUserCount = query[0].reportedUserCount;
                    totalReport = reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                    totalReport = 0;
                }

                try {
                    idapsara = query[0].idApsara;
                } catch (e) {
                    idapsara = "";
                }
                try {
                    apsara = query[0].apsara;
                } catch (e) {
                    apsara = false;
                }
                var type = query[0].type;
                pict = [idapsara];

                if (idapsara === "") {
                    data = [];
                } else {
                    if (type === "image") {

                        try {
                            dataapsara = await this.postContentService.getImageApsara(pict);
                        } catch (e) {
                            dataapsara = [];
                        }
                    }
                    else if (type === "video") {
                        try {
                            dataapsara = await this.postContentService.getVideoApsara(pict);
                        } catch (e) {
                            dataapsara = [];
                        }

                    }

                }

                if (idapsara === undefined || idapsara === "" || idapsara === null) {
                    idapsaradefine = "";

                } else {
                    idapsaradefine = idapsara;

                }
                objk = {
                    "_id": query[0]._id,
                    "userID": query[0].userID,
                    "name": query[0].name,
                    "nameType": query[0].nameType,
                    "status": query[0].status,
                    "timestamp": query[0].timestamp,
                    "totalUsedCredit": query[0].totalUsedCredit,
                    "type": query[0].type,
                    "tayang": query[0].tayang,
                    "usedCredit": query[0].usedCredit,
                    "usedCreditFree": query[0].usedCreditFree,
                    "creditFree": query[0].creditFree,
                    "creditValue": query[0].creditValue,
                    "totalCredit": query[0].totalCredit,
                    "totalView": tView,
                    "totalClick": tClick,
                    "idApsara": query[0].idApsara,
                    "reportedStatus": query[0].reportedStatus,
                    "reportedUserCount": query[0].reportedUserCount,
                    "reportedUser": query[0].reportedUser,
                    "reportedUserHandle": query[0].reportedUserHandle,
                    "contentModeration": query[0].contentModeration,
                    "contentModerationResponse": query[0].contentModerationResponse,
                    "interest": query[0].interest,
                    "place": query[0].place,
                    "reportStatusLast": query[0].reportStatusLast,
                    "createdAtReportLast": query[0].createdAtReportLast,
                    "createdAtAppealLast": query[0].createdAtAppealLast,
                    "reasonLastReport": query[0].reasonLastReport,
                    "reasonLastAppeal": query[0].reasonLastAppeal,
                    "reasonLastAppealAdmin": query[0].reasonLastAppealAdmin,
                    "fullName": query[0].fullName,
                    "email": query[0].email,
                    "proofpict": query[0].proofpict,
                    "avatar": query[0].avatar,
                    "statusUser": query[0].statusUser,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara
                };

                data.push(objk);
            } else {
                data = [];

            }



            var datacount = null;
            var objcoun = {};
            var dataSum = [];

            try {

                datacount = await this.adsService.countReason(adsId);
            } catch (e) {
                datacount = null;
            }

            for (let i = 0; i < datacount.length; i++) {
                let mycount = datacount[i].myCount;
                let reason = datacount[i]._id;

                let persen = mycount * 100 / reportedUserCount;
                objcoun = {
                    reason: reason,
                    count: mycount,
                    persen: persen.toFixed(2)
                }
                dataSum.push(objcoun);
            }

            return { response_code: 202, totalReport, dataSum, data, messages };
        }

    }

    @UseGuards(JwtAuthGuard)
    @Post('listuserreport')
    async finduserreport(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        var type = null;
        var postID = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["postID"] !== undefined) {
            postID = request_json["postID"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var data = [];
        var query = null;

        var reportedUser = [];
        var reportedUserCount = null;
        var mediaprofilepicts = null;
        var mediaprofilepicts_res = {};
        var lengUser = null;
        var media = null;
        if (type === "content") {

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;

            try {
                query = await this.postsService.findreportuserdetail(postID);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || lengUser > 0) {

                    for (let i = 0; i < lengUser; i++) {


                        let createdAt = reportedUser[i].createdAt;
                        let remark = reportedUser[i].description;
                        let email = reportedUser[i].email;

                        try {
                            datauser = await this.userbasicsService.findOne(email);
                        } catch (e) {
                            datauser = null;
                        }

                        if (datauser !== null || datauser !== undefined) {
                            try {
                                media = datauser._doc.profilePict.oid;
                            } catch (e) {
                                media = null;
                            }
                            var fullName = datauser._doc.fullName;

                            if (media !== null) {

                                try {

                                    mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                                    console.log(mediaprofilepicts)
                                    var mediaUri = mediaprofilepicts.mediaUri;
                                    let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
                                    mediaprofilepicts_res = {
                                        mediaBasePath: mediaprofilepicts.mediaBasePath,
                                        mediaUri: mediaprofilepicts.mediaUri,
                                        mediaType: mediaprofilepicts.mediaType,
                                        mediaEndpoint: result
                                    };
                                } catch (e) {

                                    mediaprofilepicts_res = {
                                        mediaBasePath: "",
                                        mediaUri: "",
                                        mediaType: "",
                                        mediaEndpoint: ""
                                    };
                                }
                            } else {
                                mediaprofilepicts_res = {
                                    mediaBasePath: "",
                                    mediaUri: "",
                                    mediaType: "",
                                    mediaEndpoint: ""
                                };
                            }
                        }

                        objrepuser = {
                            "fullName": fullName,
                            "email": email,
                            "createdAt": createdAt,
                            "description": remark,
                            "avatar": mediaprofilepicts_res,

                        }



                        arrRepuser.push(objrepuser);

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }
        }
        else if (type === "ads") {
            var adsId = mongoose.Types.ObjectId(postID);

            var objrepuser = {};
            var arrRepuser = [];
            var datauser = null;
            try {
                query = await this.adsService.detailadsreport(adsId);
            } catch (e) {
                query = null;
            }


            if (query !== null) {

                try {
                    reportedUser = query[0].reportedUser;
                    lengUser = reportedUser.length;
                } catch (e) {
                    reportedUser = null;
                    lengUser = 0;
                }
                try {
                    reportedUserCount = query[0].reportedUserCount;
                } catch (e) {
                    reportedUserCount = 0;
                }


                if (reportedUser !== null || reportedUser !== undefined || reportedUser.length > 0) {

                    for (let i = 0; i < reportedUser.length; i++) {


                        let createdAt = reportedUser[i].createdAt;
                        let remark = reportedUser[i].description;
                        let email = reportedUser[i].email;
                        try {
                            datauser = await this.userbasicsService.findOne(email);
                        } catch (e) {
                            datauser = null;
                        }

                        if (datauser !== null || datauser !== undefined) {

                            try {
                                media = datauser._doc.profilePict.oid;
                            } catch (e) {
                                media = null;
                            }
                            var fullName = datauser._doc.fullName;

                            if (media !== null) {

                                try {

                                    mediaprofilepicts = await this.mediaprofilepictsService.findOnemediaID(media);
                                    console.log(mediaprofilepicts)
                                    var mediaUri = mediaprofilepicts.mediaUri;
                                    let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
                                    mediaprofilepicts_res = {
                                        mediaBasePath: mediaprofilepicts.mediaBasePath,
                                        mediaUri: mediaprofilepicts.mediaUri,
                                        mediaType: mediaprofilepicts.mediaType,
                                        mediaEndpoint: result
                                    };
                                } catch (e) {

                                    mediaprofilepicts_res = {
                                        mediaBasePath: "",
                                        mediaUri: "",
                                        mediaType: "",
                                        mediaEndpoint: ""
                                    };
                                }
                            } else {
                                mediaprofilepicts_res = {
                                    mediaBasePath: "",
                                    mediaUri: "",
                                    mediaType: "",
                                    mediaEndpoint: ""
                                };
                            }
                        }
                        objrepuser = {
                            "fullName": fullName,
                            "email": email,
                            "createdAt": createdAt,
                            "description": remark,
                            "avatar": mediaprofilepicts_res,

                        }

                        arrRepuser.push(objrepuser);

                    }

                    let active = reportedUser[lengUser - 1].active;

                    if (active === true) {
                        data = arrRepuser;
                    } else {
                        data = [];
                    }

                } else {
                    data = [];
                }


            }


        }

        return { response_code: 202, totalReport: reportedUserCount, data, messages };

    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async reportHandleDelete(@Req() request) {

        var postID = null;

        var type = null;
        var remark = null;
        var reasonId = null;
        var request_json = JSON.parse(JSON.stringify(request.body));

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

        reasonId = request_json["reasonId"];
        remark = request_json["remark"];


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
        var datacontent = null;
        var objreporthandle = {};
        var arrayreportedHandle = [];
        var reportedUserHandle = [];

        if (type === "content") {
            try {
                datacontent = await this.postsService.findByPostId(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }

            if (reportedUserHandle.length > 0) {
                await this.postsService.updateActive(postID, dt.toISOString(), remark);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.postsService.updateActiveEmpty(postID, dt.toISOString(), arrayreportedHandle);
            }

        }
        else if (type === "ads") {
            try {
                datacontent = await this.adsService.findOne(postID);
                reportedUserHandle = datacontent._doc.reportedUserHandle;

            } catch (e) {
                datacontent = null;
                reportedUserHandle = [];
            }
            var adsId = mongoose.Types.ObjectId(postID);

            if (reportedUserHandle.length > 0) {
                await this.adsService.updateActive(adsId, dt.toISOString(), remark);

            } else {

                objreporthandle = {
                    "remark": remark,
                    "createdAt": dt.toISOString(),
                    "updatedAt": dt.toISOString(),
                    "status": "DELETE"
                };
                arrayreportedHandle.push(objreporthandle);

                await this.adsService.updateActiveEmpty(adsId, dt.toISOString(), arrayreportedHandle);
            }


        }

        return { response_code: 202, messages };
    }
}
