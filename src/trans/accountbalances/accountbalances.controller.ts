import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request } from '@nestjs/common';
import { AccountbalancesService } from './accountbalances.service';
import { CreateAccountbalancesDto } from './dto/create-accountbalances.dto';
import { Accountbalances } from './schemas/accountbalances.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
@Controller('api/accountbalances')
export class AccountbalancesController {
    constructor(private readonly accountbalancesService: AccountbalancesService, private readonly userbasicsService: UserbasicsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async search(@Req() request: Request): Promise<any> {
        var email = null;
        var data = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            var iduser = ubasic._id;
            data = await this.accountbalancesService.findsaldo(iduser);
        } else {
            data = await this.accountbalancesService.findsaldoall();
        }

        const messages = {
            "info": ["The process successful"],
        };


        return { response_code: 202, data, messages };
    }


    @Post('wallet')
    @UseGuards(JwtAuthGuard)
    async searchwallet(@Req() request: Request): Promise<any> {
        var startdate = null;
        var enddate = null;
        var email = null;
        var data = null;
        var datasaldo = null;
        var datapenarikan = null;
        var iduser = null;
        var totalsaldo = null;
        var totalpenarikan = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;

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
        try {
            datasaldo = await this.accountbalancesService.findwallettotalsaldo(iduser);
        } catch (e) {
            datasaldo = "";
        }

        try {
            datapenarikan = await this.accountbalancesService.findwalletpenarikan(iduser, startdate, enddate);
        } catch (e) {
            datapenarikan = "";
        }
        try {
            totalsaldo = datasaldo[0].totalsaldo;
        } catch (e) {
            totalsaldo = 0;
        }

        try {
            totalpenarikan = datapenarikan[0].totalpenarikan;
        } catch (e) {
            totalpenarikan = 0;
        }
        const messages = {
            "info": ["The process successful"],
        };

        data = { "startdate": startdate, "enddate": enddate, "totalsaldo": totalsaldo, "totalpenarikan": totalpenarikan }

        return { response_code: 202, data, messages };
    }

    @Post('history')
    @UseGuards(JwtAuthGuard)
    async searchhistory(@Req() request: Request): Promise<any> {
        var startdate = null;
        var enddate = null;
        var iduser = null;
        var email = null;
        var data = null;
        var skip = null;
        var limit = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;

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


        data = await this.accountbalancesService.findwallethistory(iduser, startdate, enddate, skip, limit);

        return { response_code: 202, data, messages };
    }

    @Post('detailrewards')
    @UseGuards(JwtAuthGuard)
    async detailrewards(@Req() request: Request): Promise<any> {
        var id = null;
        var data = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;


        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];

        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        const messages = {
            "info": ["The process successful"],
        };
        var idtr = mongoose.Types.ObjectId(id);

        data = await this.accountbalancesService.detailrewards(idtr);

        return { response_code: 202, data, messages };
    }


    // @Post('history/transaction')
    // @UseGuards(JwtAuthGuard)
    // async searchhistorytransaksi(@Req() request: Request): Promise<any> {
    //     var startdate = null;
    //     var enddate = null;
    //     var iduser = null;
    //     var email = null;
    //     var data = null;
    //     var skip = null;
    //     var limit = null;
    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if (request_json["email"] !== undefined) {
    //         email = request_json["email"];
    //         var ubasic = await this.userbasicsService.findOne(email);

    //         iduser = ubasic._id;

    //     } else {
    //         throw new BadRequestException("Unabled to proceed");
    //     }
    //     // if (request_json["startdate"] !== undefined) {
    //     //     startdate = request_json["startdate"];
    //     // } else {
    //     //     throw new BadRequestException("Unabled to proceed");
    //     // }

    //     // if (request_json["enddate"] !== undefined) {
    //     //     enddate = request_json["enddate"];
    //     // } else {
    //     //     throw new BadRequestException("Unabled to proceed");
    //     // }

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
    //     const messages = {
    //         "info": ["The process successful"],
    //     };
    //     const mongoose = require('mongoose');
    //     var ObjectId = require('mongodb').ObjectId;
    //     var idadmin = mongoose.Types.ObjectId(iduser);

    //     data = await this.accountbalancesService.findhistorySell(idadmin, skip, limit);

    //     console.log(data);
    //     return { response_code: 202, data, messages };
    // }
}
