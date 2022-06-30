import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, BadRequestException, HttpStatus, Put, Headers, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionsDto } from './dto/create-transactions.dto';
import { Transactions } from './schemas/transactions.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { SettingsService } from '../settings/settings.service';
import { MethodepaymentsService } from '../methodepayments/methodepayments.service';
import { PostsService } from '../../content/posts/posts.service';
import { BanksService } from '../banks/banks.service';
@Controller('api/transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService, private readonly userbasicsService: UserbasicsService,
        private readonly settingsService: SettingsService,
        private readonly methodepaymentsService: MethodepaymentsService,
        private readonly banksService: BanksService,
        private readonly postsService: PostsService) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers('Authorization') auth: string, @Body() CreateTransactionsDto: CreateTransactionsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var postid = null;
        var amount = 0;
        var salelike = null;
        var saleview = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["postid"] !== undefined) {
            postid = request_json["postid"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["amount"] !== undefined) {
            amount = request_json["amount"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["salelike"] !== undefined) {
            salelike = request_json["salelike"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["saleview"] !== undefined) {
            saleview = request_json["saleview"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);

        var totalamount = 0;
        var email = x.email;

        var datatransaction = await this.transactionsService.findAll();
        var leng = datatransaction.length + 1;

        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);



        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);

        var rotahun = this.romawi(numtahun);
        var robulan = this.romawi(numbulan);
        var rotanggal = this.romawi(numtanggal);
        var no = "INV/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;

        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var dt = new Date(Date.now());

        var datapost = null;
        try {
            datapost = await this.postsService.findid(postid);

            var emailseller = datapost._doc.email;
            var ubasicseller = await this.userbasicsService.findOne(emailseller);
            var iduserseller = ubasicseller._id;

        } catch (e) {
            datapost = null;
        }

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idppn = "62bbbe43a7520000050077a3";
        var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvacharge = "62bd40e0f37a00001a004366";

        var datasettingppn = null;
        var datamradmin = null;
        var databankvacharge = null;
        try {
            datasettingppn = await this.settingsService.findOne(idppn);
            datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);

            var valueppn = datasettingppn._doc.value;
            var nominalppn = amount * valueppn / 100;
            var valuevacharge = databankvacharge._doc.value;
            var valuemradmin = datamradmin._doc.value;
            var nominalmradmin = amount * valuemradmin / 100;

            var prosentase = valueppn + valuemradmin;
            var calculate = amount * prosentase / 100;
            totalamount = amount + calculate + valuevacharge;



        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }
        CreateTransactionsDto.iduserbuyer = iduser;
        CreateTransactionsDto.idusersell = iduserseller;
        CreateTransactionsDto.timestamp = dt.toISOString();
        CreateTransactionsDto.noinvoice = no;
        CreateTransactionsDto.status = "draft";
        CreateTransactionsDto.bank = null;
        CreateTransactionsDto.nova = "";
        CreateTransactionsDto.accountbalance = null;
        CreateTransactionsDto.paymentmethod = null;
        CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
        CreateTransactionsDto.totalamount = totalamount;
        CreateTransactionsDto.description = "buy draft content";
        try {
            let datatr = await this.transactionsService.create(CreateTransactionsDto);


            var data = {

                "noinvoice": datatr.noinvoice,
                "postid": datatr.postid,
                "idusersell": datatr.idusersell,
                "iduserbuyer": datatr.iduserbuyer,
                "amount": datatr.amount,
                "paymentmethod": datatr.paymentmethod,
                "status": datatr.status,
                "description": datatr.description,
                "nova": datatr.nova,
                "salelike": datatr.saleview,
                "saleview": datatr.salelike,
                "bank": datatr.bank,
                "ppn": valueppn + " %",
                "nominalppn": nominalppn,
                "bankvacharge": valuevacharge,
                "mdradmin": valuemradmin + " %",
                "nominalmdradmin": nominalmradmin,
                "totalamount": datatr.totalamount,
                "accountbalance": datatr.accountbalance,
                "timestamp": datatr.timestamp,
                "_id": datatr._id
            };

            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Put('status/:id')
    async update(@Res() res, @Param('id') id: string, @Body() createTransactionsDto: CreateTransactionsDto, @Req() request: Request) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var bankcode = null;
        var paymentmethod = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["paymentmethod"] !== undefined) {
            paymentmethod = request_json["paymentmethod"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var value = 0;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idppn = "62bbbe43a7520000050077a3";
        var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvacharge = "62bd40e0f37a00001a004366";

        var methodeid = createTransactionsDto.paymentmethod;
        var idmethode = null;
        var idbank = null;
        var datamethode = null;
        var namamethode = "";
        try {
            datamethode = await this.methodepaymentsService.findmethodename(paymentmethod);
            namamethode = datamethode._doc.methodename;
            idmethode = datamethode._doc._id;

        } catch (e) {
            throw new BadRequestException("Methode payment not found...!");
        }

        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        var datasettingppn = null;
        var datamradmin = null;
        var databankvacharge = null;
        try {
            datasettingppn = await this.settingsService.findOne(idppn);
            datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);

            var valueppn = datasettingppn._doc.value;
            var valuevacharge = databankvacharge._doc.value;
            var valuemradmin = datamradmin._doc.value;

        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }
        try {
            createTransactionsDto.nova = "3838383388";
            createTransactionsDto.status = "pending";
            createTransactionsDto.description = "buy pending content";
            createTransactionsDto.bank = idbank;
            createTransactionsDto.paymentmethod = idmethode;
            let datatr = await this.transactionsService.update(id, createTransactionsDto);
            var nominalppn = datatr.amount * valueppn / 100;
            var nominalmradmin = datatr.amount * valuemradmin / 100;
            var data = {

                "noinvoice": datatr.noinvoice,
                "postid": datatr.postid,
                "idusersell": datatr.idusersell,
                "iduserbuyer": datatr.iduserbuyer,
                "amount": datatr.amount,
                "paymentmethod": namamethode,
                "status": datatr.status,
                "description": datatr.description,
                "nova": datatr.nova,
                "salelike": datatr.saleview,
                "saleview": datatr.salelike,
                "bank": namabank,
                "ppn": valueppn + " %",
                "nominalppn": nominalppn,
                "bankvacharge": valuevacharge,
                "mdradmin": valuemradmin + " %",
                "nominalmdradmin": nominalmradmin,
                "totalamount": datatr.totalamount,
                "accountbalance": datatr.accountbalance,
                "timestamp": datatr.timestamp,
                "_id": datatr._id
            };
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    async romawi(num: number) {
        if (typeof num !== 'number')
            return false;

        var roman = {
            M: 1000,
            CM: 900,
            D: 500,
            CD: 400,
            C: 100,
            XC: 90,
            L: 50,
            XL: 40,
            X: 10,
            IX: 9,
            V: 5,
            IV: 4,
            I: 1
        };
        var str = '';

        for (var i of Object.keys(roman)) {
            var q = Math.floor(num / roman[i]);
            num -= q * roman[i];
            str += i.repeat(q);
        }

        return str;
    }

    async parseJwt(token) {

        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };

}

