import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, BadRequestException, Req } from '@nestjs/common';
import { UservouchersService } from './uservouchers.service';
import { CreateUservouchersDto } from './dto/create-uservouchers.dto';
import { Uservouchers } from './schemas/uservouchers.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';

@Controller('api/uservouchers')
export class UservouchersController {
    constructor(private readonly uservouchersService: UservouchersService, private readonly userbasicsService: UserbasicsService, private readonly vouchersService: VouchersService, private readonly logapiSS: LogapisService, private readonly utilsService: UtilsService, private readonly newUserBasicsService: UserbasicnewService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateUservouchersDto: CreateUservouchersDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);
        var email = x.email;

        var ubasic = await this.userbasicsService.findOne(email);


        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);


        try {

            CreateUservouchersDto.createdAt = dt.toISOString();
            CreateUservouchersDto.userID = iduser;
            let data = await this.uservouchersService.create(CreateUservouchersDto);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }


    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Uservouchers[]> {
        return this.uservouchersService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Uservouchers> {
        return this.uservouchersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.uservouchersService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createUservouchersDto: CreateUservouchersDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            var dt = new Date(Date.now());

            createUservouchersDto.updatedAt = dt.toISOString();
            let data = await this.uservouchersService.update(id, createUservouchersDto);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    @Post('byuser')
    @UseGuards(JwtAuthGuard)
    async voucheruser(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = headers.host + '/api/uservouchers/byuser';

        var email = null;
        var iduser = null;
        var startdate = null;
        var enddate = null;
        var datatrue = null;
        var startday = null;
        var endday = null;
        var key = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        key = request_json["key"];
        startday = request_json["startday"];
        startdate = request_json["startdate"];
        endday = request_json["endday"];
        enddate = request_json["enddate"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The process successful"],
        };

        try {
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("user not found");
        }

        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);

        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);
        var date = substrtahun + "-" + substrbulan + "-" + substrtanggal;
        var data = null;


        data = await this.uservouchersService.findUserVoucher(iduser, key, startday, endday, startdate, enddate);

        try {
            datatrue = await this.uservouchersService.findUserVoucherTrue(iduser);
            var datenow = new Date(Date.now());
            var lenghttrue = datatrue.length;
            for (let i = 0; i < lenghttrue; i++) {
                let id = datatrue[i]._id;
                let exp = datatrue[i].expiredAt;
                let dtexp = new Date(exp);
                dtexp.setHours(dtexp.getHours() + 24);
                dtexp = new Date(dtexp);
                if (datenow > dtexp) {
                    var objid = mongoose.Types.ObjectId(id);
                    await this.uservouchersService.updatefalse(objid);
                }
            }
        } catch (e) {
            datatrue = null;
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('byuser/v2')
    @UseGuards(JwtAuthGuard)
    async voucheruserv2(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = headers.host + '/api/uservouchers/byuser/v2';

        var email = null;
        var iduser = null;
        var startdate = null;
        var enddate = null;
        var datatrue = null;
        var startday = null;
        var endday = null;
        var key = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        key = request_json["key"];
        startday = request_json["startday"];
        startdate = request_json["startdate"];
        endday = request_json["endday"];
        enddate = request_json["enddate"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The process successful"],
        };

        try {
            var ubasic = await this.newUserBasicsService.findbyemail(email);

            iduser = ubasic._id;
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("user not found");
        }

        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);

        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);
        var date = substrtahun + "-" + substrbulan + "-" + substrtanggal;
        var data = null;


        data = await this.uservouchersService.findUserVoucher(iduser, key, startday, endday, startdate, enddate);

        try {
            datatrue = await this.uservouchersService.findUserVoucherTrue(iduser);
            var datenow = new Date(Date.now());
            var lenghttrue = datatrue.length;
            for (let i = 0; i < lenghttrue; i++) {
                let id = datatrue[i]._id;
                let exp = datatrue[i].expiredAt;
                let dtexp = new Date(exp);
                dtexp.setHours(dtexp.getHours() + 24);
                dtexp = new Date(dtexp);
                if (datenow > dtexp) {
                    var objid = mongoose.Types.ObjectId(id);
                    await this.uservouchersService.updatefalse(objid);
                }
            }
        } catch (e) {
            datatrue = null;
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @Post('bycode')
    @UseGuards(JwtAuthGuard)
    async voucherkode(@Req() request: Request): Promise<any> {

        var email = null;
        var iduser = null;
        var codeVoucher = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["codeVoucher"] !== undefined) {
            codeVoucher = request_json["codeVoucher"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        const messages = {
            "info": ["The process successful"],
        };

        try {
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;
        } catch (e) {
            throw new BadRequestException("user not found");
        }

        // var curdate = new Date(Date.now());
        // var beforedate = curdate.toISOString();

        // var substrtahun = beforedate.substring(0, 4);
        // var numtahun = parseInt(substrtahun);

        // var substrbulan = beforedate.substring(7, 5);
        // var numbulan = parseInt(substrbulan);
        // var substrtanggal = beforedate.substring(10, 8);
        // var numtanggal = parseInt(substrtanggal);
        // var date = substrtahun + "-" + substrbulan + "-" + substrtanggal;
        let data = await this.uservouchersService.findUserKodeVoucher(iduser, codeVoucher);

        return { response_code: 202, data, messages };
    }

    @Post('change')
    @UseGuards(JwtAuthGuard)
    async voucheruserchange(@Res() res, @Req() request: Request): Promise<any> {

        var email = null;
        var iduser = null;
        var idvoucher = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["idvoucher"] !== undefined) {
            idvoucher = request_json["idvoucher"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }



        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var arrayId = [];
        var objid = {};
        var arrayqty = [];
        var arraymount = [];
        var arrayCredittotal = [];
        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);

        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);
        var date = substrtahun + "-" + substrbulan + "-" + substrtanggal;
        const messages = {
            "info": ["The process successful"],
        };
        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        try {
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;
        } catch (e) {
            throw new BadRequestException("user not found");
        }

        var lenghtvc = idvoucher.length;
        var datavoucher = null;
        var sumCredittotal = 0;
        var tCreditTotal = 0;
        var jml = 0;
        for (var i = 0; i < lenghtvc; i++) {

            var idv = mongoose.Types.ObjectId(idvoucher[i].id);

            try {
                datavoucher = await this.uservouchersService.findUserVoucherID(iduser, date, idv);
                jml = datavoucher[0].jmlVoucher;
                tCreditTotal = (await datavoucher)[0].creditTotal;

                objid = {
                    "id": idvoucher[i].id,
                    "noVoucher": (await datavoucher)[0].noVoucher,
                    "codeVoucher": (await datavoucher)[0].codeVoucher,
                    "nameAds": (await datavoucher)[0].nameAds,
                    "expiredAt": (await datavoucher)[0].expiredAt,
                    "jmlVoucher": jml,
                    "totalCredit": (await datavoucher)[0].creditTotal,
                };
                arrayId.push(objid);
                arrayCredittotal.push(tCreditTotal);

            } catch (e) {
                throw new BadRequestException("Voucher is expired");
            }

        }

        for (var i = 0; i < arrayCredittotal.length; i++) {
            sumCredittotal += arrayCredittotal[i];
        };


        try {
            var data = { "voucherList": arrayId, "totalCredit": sumCredittotal };
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    async generateNumber() {
        const getRandomId = (min = 0, max = 500000) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            return num.toString().padStart(6, "0")
        };
        return getRandomId();
    }

    async parseJwt(token) {

        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };
}
