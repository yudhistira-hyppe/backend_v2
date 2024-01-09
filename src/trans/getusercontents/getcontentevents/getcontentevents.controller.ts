import { Body, Controller, Delete, Headers, Param, Post, UseGuards, Req, BadRequestException, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { GetcontenteventsService } from './getcontentevents.service';
import { CreateGetcontenteventsDto } from './dto/create-getcontentevents.dto';
import { Getcontentevents } from './schemas/getcontentevents.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from "../../../utils/utils.service";
import { ErrorHandler } from "../../../utils/error.handler";
import { PostsService } from "../../../content/posts/posts.service";
import { AvatarDTO, ProfileDTO } from '../../../utils/data/Profile';

@Controller()
export class GetcontenteventsController {
    constructor(private readonly getcontenteventsService: GetcontenteventsService,
        private readonly errorHandler: ErrorHandler,
        private readonly utilsService: UtilsService,
        private readonly postsService: PostsService) { }

    @Post('api/getcontentevents')
    @UseGuards(JwtAuthGuard)
    async contentuserallmanagement(@Req() request: Request): Promise<any> {

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
        var datagenderperempuan = 0;
        var datagenderlaki = 0;
        var datagendermale = 0;
        var datagenderfemale = 0;
        var datagender_female = 0;

        //  let datagender = await this.getcontenteventsService.findgender(postID);

        let dataall = await this.getcontenteventsService.findall(postID);
        let dataperempuan = await this.getcontenteventsService.findgender_perempuan(postID);
        let datalaki = await this.getcontenteventsService.findgender_laki(postID);
        let datamale = await this.getcontenteventsService.findgenderMale(postID);
        let datafemale = await this.getcontenteventsService.findgenderFeMale(postID);
        let data_female = await this.getcontenteventsService.findgender_FeMale(postID);
        //  var lenggender = datagender.length;
        var datapost = [];
        try {
            datagenderperempuan = dataperempuan[0].totalpost;
        } catch (e) {
            datagenderperempuan = 0;
        }

        try {
            datagenderlaki = datalaki[0].totalpost;
        } catch (e) {
            datagenderlaki = 0;
        }
        try {
            datagendermale = datamale[0].totalpost;
        } catch (e) {
            datagendermale = 0;
        }
        try {
            datagenderfemale = datafemale[0].totalpost;
        } catch (e) {
            datagenderfemale = 0;
        }
        try {
            datagender_female = data_female[0].totalpost;
        } catch (e) {
            datagender_female = 0;
        }

        var totalmale = datagenderlaki + datagendermale;
        var totalfemale = datagenderfemale + datagenderperempuan + datagender_female;
        var totalpost = dataall.length;


        var tepostmale = totalmale * 100 / totalpost;
        var tpostmale = tepostmale.toFixed(2);

        var tepostfemale = totalfemale * 100 / totalpost;
        var tpostfemale = tepostfemale.toFixed(2);
        console.log(tpostfemale);
        datapost = [{ "_id": "MALE", "totalpost": tpostmale }, { "_id": "FEMALE", "totalpost": tpostfemale }];

        var totalage = 0;
        var totalage40 = 0;
        var totalage14 = 0;
        var dataages = [];
        var objage14 = {};

        var dataage14 = null;
        try {
            dataage14 = await this.getcontenteventsService.findage14(postID);

        } catch (e) {
            dataage14 = null;
        }
        if (dataage14 !== null) {
            var lengage14 = dataage14.length;
            for (var x = 0; x < lengage14; x++) {

                totalage14 += dataage14[x].totalpost;
            }
            var totalpostage14 = dataall.length;
            var prosentage14 = totalage14 * 100 / totalpostage14;
            var tpostage14 = prosentage14.toFixed(2);

            if (parseInt(tpostage14) > 0) {
                objage14 = { "_id": "<14", "totalpost": tpostage14 };
                dataages.push(objage14);

            } else {
                objage14 = { "_id": "<14", "totalpost": "0" };
                dataages.push(objage14);

            }

        } else {
            dataages = [];
        }


        var objage = {};
        var objage40 = {};
        var dataage = null;
        try {
            dataage = await this.getcontenteventsService.findage1440(postID);

        } catch (e) {
            dataage = null;
        }

        if (dataage !== null) {
            var lengage = dataage.length;
            for (var x = 0; x < lengage; x++) {

                totalage += dataage[x].totalpost;
            }
            var totalpostage = dataall.length;
            var prosentage1441 = totalage * 100 / totalpostage;
            var tpostage = prosentage1441.toFixed(2);

            if (parseInt(tpostage) > 0) {
                objage = { "_id": "14-40", "totalpost": tpostage };
                dataages.push(objage);
            } else {
                objage = { "_id": "14-40", "totalpost": "0" };
                dataages.push(objage);
            }
        } else {
            dataages = [];
        }




        var dataage40 = null;


        try {
            dataage40 = await this.getcontenteventsService.findage40(postID);

        } catch (e) {
            dataage40 = null;
        }

        if (dataage40 !== null) {
            var lengage40 = dataage40.length;
            for (var x = 0; x < lengage40; x++) {

                totalage40 += dataage40[x].totalpost;
            }
            var totalpostage40 = dataall.length;
            var prosentage40 = totalage40 * 100 / totalpostage40;
            var tpostage40 = prosentage40.toFixed(2);

            if (parseInt(tpostage40) > 0) {

                objage40 = { "_id": ">40", "totalpost": tpostage40 };
                dataages.push(objage40);
            } else {
                objage40 = { "_id": ">40", "totalpost": "0" };
                dataages.push(objage40);
            }


        } else {
            dataages = [];
        }

        var datalocation = null;

        try {
            datalocation = await this.getcontenteventsService.findlocation(postID);

        } catch (e) {
            datalocation = null;
        }

        if (datalocation !== null) {
            var lenglocation = datalocation.length;
            var datapostloc = [];

            var totalpostloc = dataall.length;
            var objloc = {};
            for (var x = 0; x < lenglocation; x++) {
                var location = datalocation[x]._id;
                var tepostloc = datalocation[x].totalpost * 100 / totalpostloc;
                var tpostloc = tepostloc.toFixed(2);
                objloc = { "_id": location, "totalpost": tpostloc };
                datapostloc.push(objloc);
            }
        } else {
            datapostloc = [];
        }


        var data = { "gender": datapost, "age": dataages, "location": datapostloc };
        return { response_code: 202, data, messages };
    }

    //@UseGuards(JwtAuthGuard)
    // @HttpCode(HttpStatus.ACCEPTED)
    // @Post('api/post/viewlike')
    // async getViewLike(
    //     @Body() CreateGetcontenteventsDto_: CreateGetcontenteventsDto,
    //     @Headers() headers
    // ) {
    //     if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed token and email not match',
    //         );
    //     }

    //     if (CreateGetcontenteventsDto_.postID == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed postID is required',
    //         );
    //     }

    //     if (CreateGetcontenteventsDto_.eventType == undefined) {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed eventType is required',
    //         );
    //     }

    //     //Ceck POST ID
    //     const datapostsService = await this.postsService.findid(
    //         CreateGetcontenteventsDto_.postID.toString(),
    //     );
    //     if (await this.utilsService.ceckData(datapostsService)) {
    //         CreateGetcontenteventsDto_.receiverParty = datapostsService.email;
    //         CreateGetcontenteventsDto_.active = true;
    //         var data_contentevents = await this.getcontenteventsService.getConteneventbyType(CreateGetcontenteventsDto_);
    //         var data_response = [];
    //         if (await this.utilsService.ceckData(data_contentevents)) {
    //             if (data_contentevents.length > 0) {
    //                 for (var i = 0; i < data_contentevents.length; i++) {
    //                     const data_profile = await this.utilsService.generateProfile(data_contentevents[i].email, 'FULL');
    //                     var ProfileDTO_ = new ProfileDTO();
    //                     ProfileDTO_.fullName = data_profile.fullName;
    //                     ProfileDTO_.email = data_profile.email;
    //                     ProfileDTO_.username = data_profile.username;
    //                     ProfileDTO_.urluserBadge = data_profile.urluserBadge;
    //                     var AvatarDTO_ = new AvatarDTO();
    //                     if (data_profile.avatar != undefined) {
    //                         if (data_profile.avatar.mediaBasePath != undefined) {
    //                             AvatarDTO_.mediaBasePath = data_profile.avatar.mediaBasePath;
    //                         }
    //                         if (data_profile.avatar.mediaUri != undefined) {
    //                             AvatarDTO_.mediaUri = data_profile.avatar.mediaUri;
    //                         }
    //                         if (data_profile.avatar.mediaType != undefined) {
    //                             AvatarDTO_.mediaType = data_profile.avatar.mediaType;
    //                         }
    //                         if (data_profile.avatar.mediaEndpoint != undefined) {
    //                             AvatarDTO_.mediaEndpoint = data_profile.avatar.mediaEndpoint;
    //                             var mediaEndpoint = data_profile.avatar.mediaEndpoint;
    //                             AvatarDTO_.profilePict_id = mediaEndpoint.replace("/profilepict/", "");
    //                         }
    //                         ProfileDTO_.avatar = AvatarDTO_;
    //                     } else {
    //                         ProfileDTO_.avatar = null;
    //                     }
    //                     data_response.push(ProfileDTO_);
    //                 }
    //             }
    //         }
    //         var response = {
    //             "response_code": 202,
    //             "data": data_response,
    //             "messages": {
    //                 "info": [
    //                     "successfully"
    //                 ]
    //             },
    //         }
    //         return response;
    //     } else {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed postID not found',
    //         );
    //     }
    // }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post('api/post/viewlike')
    async getViewLike(
        @Body() CreateGetcontenteventsDto_: CreateGetcontenteventsDto,
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
        const datapostsService = await this.postsService.findid(
            CreateGetcontenteventsDto_.postID.toString(),
        );
        if (await this.utilsService.ceckData(datapostsService)) {
            CreateGetcontenteventsDto_.receiverParty = datapostsService.email;
            CreateGetcontenteventsDto_.active = true;
            var data_response = await this.getcontenteventsService.getConteneventbyType2(CreateGetcontenteventsDto_);
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

    @Post('api/getcontentevents/management/groupbydate')
    @UseGuards(JwtAuthGuard)
    async groupeventsbydate(@Req() request: Request): Promise<any> {
        var data = null;
        var email = null;
        var eventTypes = [];
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json['eventTypes'] !== undefined && Array.isArray(request_json['eventTypes'])) {
            eventTypes = request_json['eventTypes'];
        }
        else {
            throw new BadRequestException("eventTypes parameter invalid");
        }
        const messages = {
            "info": ["The process successful"],
        };
        var events = await this.getcontenteventsService.findByReceiverParty(email, eventTypes);
        var byDates = await this.getcontenteventsService.groupEventsBy(events, 'date');

        var mapByDates = [];
        for (var i = 29; i >= 0; i--) {
            var d = new Date();
            d.setDate(d.getDate() - i);
            var dt = await this.utilsService.formatDateString(d);
            var count = 0;
            for (var j = 0; j < byDates.length; j++) {
                if (byDates[j].date == dt) {
                    count = byDates[j].count;
                    break;
                }
            }
            mapByDates.push({
                'date': dt,
                'count': count
            });

        }
        // console.log(mapByDates);
        data = [{ mapByDates }];

        return { response_code: 202, data, messages };
    }
}
