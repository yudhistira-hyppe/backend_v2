import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException } from '@nestjs/common';
import { GetusercontentsService } from './getusercontents.service';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents } from './schemas/getusercontents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response, Req } from '@nestjs/common';
import { Request } from 'express';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService) { }

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


}
