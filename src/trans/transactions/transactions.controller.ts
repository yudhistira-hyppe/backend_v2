import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, BadRequestException, HttpStatus, Put, Headers, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionsDto, CreateWithdraws, OyAccountInquirys, OyDisburseCallbacks, OyDisbursements, VaCallback } from './dto/create-transactions.dto';
import { Transactions } from './schemas/transactions.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { SettingsService } from '../settings/settings.service';
import { MethodepaymentsService } from '../methodepayments/methodepayments.service';
import { PostsService } from '../../content/posts/posts.service';
import { BanksService } from '../banks/banks.service';
import { Pph21sService } from '../pph21s/pph21s.service';
import { AccountbalancesService } from '../accountbalances/accountbalances.service';
import { UserbankaccountsService } from '../userbankaccounts/userbankaccounts.service';
import { OyPgService } from '../../paymentgateway/oypg/oypg.service';
import { InsightsService } from '../../content/insights/insights.service';
import { WithdrawsService } from '../withdraws/withdraws.service';
import { Types } from 'mongoose';
@Controller()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly settingsService: SettingsService,
        private readonly methodepaymentsService: MethodepaymentsService,
        private readonly banksService: BanksService,
        private readonly postsService: PostsService,
        private readonly pph21sService: Pph21sService,
        private readonly accountbalancesService: AccountbalancesService,
        private readonly oyPgService: OyPgService,
        private readonly insightsService: InsightsService,
        private readonly userbankaccountsService: UserbankaccountsService,
        private readonly withdrawsService: WithdrawsService

    ) { }
    @UseGuards(JwtAuthGuard)
    @Post('api/transactions')
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateTransactionsDto: CreateTransactionsDto, @Request() request) {
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
        var bankcode = null;
        var paymentmethod = null;
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

        if (request_json["paymentmethod"] !== undefined) {
            paymentmethod = request_json["paymentmethod"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);
        var datatrpending = null;


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
        var namapembeli = ubasic.fullName;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var datapost = null;
        try {
            datapost = await this.postsService.findid(postid);

            var emailseller = datapost._doc.email;
            var ubasicseller = await this.userbasicsService.findOne(emailseller);
            var iduserseller = ubasicseller._id;
            var namapenjual = ubasicseller.fullName;

        } catch (e) {
            datapost = null;
        }


        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idppn = "62bbbe43a7520000050077a3";
        var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvacharge = "62bd40e0f37a00001a004366";
        var idexpiredva = "62bbbe8ea7520000050077a4";
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


        try {
            datatrpending = await this.transactionsService.findpostidpending(postid);


        } catch (e) {
            datatrpending = null;

        }


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
        var datasettingexpiredva = null;
        try {
            datasettingppn = await this.settingsService.findOne(idppn);
            datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);
            datasettingexpiredva = await this.settingsService.findOne(idexpiredva);
            var valueppn = datasettingppn._doc.value;
            var valuevacharge = databankvacharge._doc.value;
            var valuemradmin = datamradmin._doc.value;
            var valueexpiredva = datasettingexpiredva._doc.value;

        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }



        var userbuy = iduser;
        var name = ubasic.fullName;


        if (datatrpending !== null) {

            var datenow = new Date(Date.now());
            var expiredvas = datatrpending.expiredtimeva;
            var dateVa = new Date(expiredvas);
            dateVa.setHours(dateVa.getHours() - 7); // timestamp


            var idtransaction = datatrpending._id;

            if (datenow > dateVa) {
                var datava = {
                    "partner_user_id": userbuy.toString(),
                    "amount": totalamount,
                    "bank_code": bankcode,
                    "is_open": false,
                    "is_single_use": true,
                    "is_lifetime": false,
                    "username_display": name.toString(),
                    "email": email,
                    "trx_expiration_time": valueexpiredva,
                }

                try {
                    let datareqva = await this.oyPgService.generateStaticVa(datava);
                    var statuscodeva = datareqva.status.code;
                    var nova = datareqva.va_number;
                    var expiredva = datareqva.trx_expiration_time;
                    var d1 = new Date(expiredva);
                    d1.setHours(d1.getHours() + 7); // timestamp
                    d1 = new Date(d1);


                } catch (e) {
                    throw new BadRequestException("Not process..!");

                }

                if (statuscodeva == "000") {
                    CreateTransactionsDto.iduserbuyer = iduser;
                    CreateTransactionsDto.idusersell = iduserseller;
                    CreateTransactionsDto.timestamp = dt.toISOString();
                    CreateTransactionsDto.noinvoice = no;
                    CreateTransactionsDto.status = "pending";
                    CreateTransactionsDto.bank = idbank;
                    CreateTransactionsDto.nova = nova;
                    CreateTransactionsDto.accountbalance = null;
                    CreateTransactionsDto.paymentmethod = idmethode;
                    CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                    CreateTransactionsDto.totalamount = totalamount;
                    CreateTransactionsDto.description = "buy pending content";
                    CreateTransactionsDto.payload = null;
                    CreateTransactionsDto.expiredtimeva = d1.toISOString();
                    try {
                        let datatr = await this.transactionsService.create(CreateTransactionsDto);

                        await this.transactionsService.updatestatuscancel(idtransaction);
                        var data = {
                            "noinvoice": datatr.noinvoice,
                            "postid": datatr.postid,
                            "idusersell": datatr.idusersell,
                            "NamaPenjual": namapenjual,
                            "iduserbuyer": datatr.iduserbuyer,
                            "NamaPembeli": namapembeli,
                            "amount": datatr.amount,
                            "paymentmethod": namamethode,
                            "status": datatr.status,
                            "description": datatr.description,
                            "nova": datatr.nova,
                            "expiredtimeva": datatr.expiredtimeva,
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
                else if (statuscodeva == "217") {
                    throw new BadRequestException("VA Number is still active for this partner user id !");
                }
                else {
                    throw new BadRequestException("Given amount are greater than allowed value for static va value not found..!");
                }
            } else {
                throw new BadRequestException("This content is already in the process of being purchased");
            }


        }
        else {

            var datava = {
                "partner_user_id": userbuy.toString(),
                "amount": totalamount,
                "bank_code": bankcode,
                "is_open": false,
                "is_single_use": true,
                "is_lifetime": false,
                "username_display": name.toString(),
                "email": email,
                "trx_expiration_time": valueexpiredva,
            }

            try {
                let datareqva = await this.oyPgService.generateStaticVa(datava);
                var statuscodeva = datareqva.status.code;
                var nova = datareqva.va_number;
                var expiredva = datareqva.trx_expiration_time;
                var d1 = new Date(expiredva);
                d1.setHours(d1.getHours() + 7); // timestamp
                d1 = new Date(d1);


            } catch (e) {
                throw new BadRequestException("Not process..!");

            }

            if (statuscodeva == "000") {
                CreateTransactionsDto.iduserbuyer = iduser;
                CreateTransactionsDto.idusersell = iduserseller;
                CreateTransactionsDto.timestamp = dt.toISOString();
                CreateTransactionsDto.noinvoice = no;
                CreateTransactionsDto.status = "pending";
                CreateTransactionsDto.bank = idbank;
                CreateTransactionsDto.nova = nova;
                CreateTransactionsDto.accountbalance = null;
                CreateTransactionsDto.paymentmethod = idmethode;
                CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                CreateTransactionsDto.totalamount = totalamount;
                CreateTransactionsDto.description = "buy pending content";
                CreateTransactionsDto.payload = null;
                CreateTransactionsDto.expiredtimeva = d1.toISOString();
                try {
                    let datatr = await this.transactionsService.create(CreateTransactionsDto);


                    var data = {

                        "noinvoice": datatr.noinvoice,
                        "postid": datatr.postid,
                        "idusersell": datatr.idusersell,
                        "NamaPenjual": namapenjual,
                        "iduserbuyer": datatr.iduserbuyer,
                        "NamaPembeli": namapembeli,
                        "amount": datatr.amount,
                        "paymentmethod": namamethode,
                        "status": datatr.status,
                        "description": datatr.description,
                        "nova": datatr.nova,
                        "expiredtimeva": datatr.expiredtimeva,
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
            } else if (statuscodeva == "217") {
                throw new BadRequestException("This content is already in the process of being purchased!");
            }
            else {
                throw new BadRequestException("This content is already in the process of being purchased");
            }
        }




    }

    @UseGuards(JwtAuthGuard)
    @Put('api/transactions/status/:id')
    async update(@Res() res, @Headers('x-auth-token') auth: string, @Param('id') id: string, @Body() createTransactionsDto: CreateTransactionsDto, @Req() request: Request) {

        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);

        var email = x.email;

        var ubasic = await this.userbasicsService.findOne(email);
        var name = ubasic.fullName;
        var useridbuy = ubasic._id;

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var datatransaksi = null;
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
        var idexpiredva = "62bbbe8ea7520000050077a4";
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
        var datasettingexpiredva = null;
        try {
            datasettingppn = await this.settingsService.findOne(idppn);
            datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);
            datasettingexpiredva = await this.settingsService.findOne(idexpiredva);
            var valueppn = datasettingppn._doc.value;
            var valuevacharge = databankvacharge._doc.value;
            var valuemradmin = datamradmin._doc.value;
            var valueexpiredva = datasettingexpiredva._doc.value;

        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }

        try {
            datatransaksi = await this.transactionsService.findid(id);
        } catch (e) {
            datatransaksi = null;
        }

        var userbuy = datatransaksi._doc.iduserbuyer;
        var totalamoun = datatransaksi._doc.totalamount;

        var datava = {
            "partner_user_id": userbuy.toString(),
            "amount": totalamoun,
            "bank_code": bankcode,
            "is_open": false,
            "is_single_use": true,
            "is_lifetime": false,
            "username_display": name.toString(),
            "email": email,
            "trx_expiration_time": valueexpiredva,
        }

        try {
            let datareqva = await this.oyPgService.generateStaticVa(datava);
            var statuscodeva = datareqva.status.code;
            var nova = datareqva.va_number;
            var expiredva = datareqva.trx_expiration_time;
            var d1 = new Date(expiredva);
            d1.setHours(d1.getHours() + 7); // timestamp
            d1 = new Date(d1);


        } catch (e) {
            throw new BadRequestException("Not process..!");

        }




        if (statuscodeva == "000") {

            try {
                createTransactionsDto.nova = nova;
                createTransactionsDto.status = "pending";
                createTransactionsDto.description = "buy pending content";
                createTransactionsDto.bank = idbank;
                createTransactionsDto.paymentmethod = idmethode;
                createTransactionsDto.expiredtimeva = d1.toISOString();
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
                    "expiredtimeva": datatr.expiredtimeva,
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
        } else {
            throw new BadRequestException("Given amount are greater than allowed value for static va value not found..!");

        }

    }

    @Post('api/pg/oy/callback/va')
    async callbackVa(@Res() res, @Body() payload: VaCallback) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesnull = {
            "info": ["This process is success but cannot update"],
        };

        var nova = payload.va_number;
        var statussucces = payload.success;
        var datatransaksi = null;
        var datapost = null;
        var datainsight = null;
        if (statussucces == true) {

            try {

                datatransaksi = await this.transactionsService.findva(nova);
                var idtransaction = datatransaksi._id;
                var postid = datatransaksi.postid;
                var idusersell = datatransaksi.idusersell;
                var iduserbuy = datatransaksi.iduserbuyer;
                var amount = datatransaksi.amount;
                var status = datatransaksi.status;
                var salelike = datatransaksi.salelike;
                var saleview = datatransaksi.saleview;

                if (status == "pending") {
                    var ubasic = await this.userbasicsService.findid(iduserbuy);
                    var emailbuyer = ubasic.email;
                    var createbalance = await this.accontbalance(postid, idusersell, amount);
                    let databalance = await this.accountbalancesService.findOne(idusersell);

                    var idbalance = databalance._id;
                    datainsight = await this.insightsService.findemail(emailbuyer.toString());
                    var idinsight = datainsight._id;
                    var likeinsig = datainsight.likes;
                    var viewinsigh = datainsight.views;
                    datapost = await this.postsService.findid(postid);
                    var like = datapost.likes;
                    var view = datapost.views;

                    var datapph = await this.pph(idtransaction, idusersell, amount, postid);


                    await this.transactionsService.updateone(idtransaction, idbalance, payload);



                    await this.postsService.updateemail(postid, emailbuyer.toString(), iduserbuy);
                    if (salelike == false) {
                        await this.postsService.updatesalelike(postid);

                    } else {
                        var totallike = like + likeinsig;
                        await this.insightsService.updatesalelike(idinsight, totallike);


                    }

                    if (saleview == false) {
                        await this.postsService.updatesaleview(postid);
                    } else {
                        var totalview = view + viewinsigh;
                        await this.insightsService.updatesaleview(idinsight, totalview);
                    }

                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messages
                    });
                } else {
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messagesnull
                    });
                }

            } catch (e) {
                throw new BadRequestException("Unabled to proceed");
            }

        }


    }

    @Post('api/transactions/withdraw')
    async createwithdraw(@Res() res, @Headers('x-auth-token') auth: string, @Body() OyDisbursements: OyDisbursements, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var email = null;
        var recipient_bank = null;
        var recipient_account = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["recipient_bank"] !== undefined) {
            recipient_bank = request_json["recipient_bank"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["recipient_account"] !== undefined) {
            recipient_account = request_json["recipient_account"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var amounreq = OyDisbursements.amount;
        var totalsaldo = 0;
        var databalance = null;
        var datarek = null;
        var databank = null;
        var namabank = "";
        var idbank = null;
        var statusInquiry = null;
        var datasettingbankvercharge = null;
        var datasettingdisbvercharge = null;
        var valuebankcharge = 0;
        var valuedisbcharge = 0;
        var namarek = null;
        var nama = null;
        var kodebank = null;
        var norekdb = null;

        var idbankverificationcharge = "62bd4104f37a00001a004367";
        var idBankDisbursmentCharge = "62bd4126f37a00001a004368";

        try {
            databalance = await this.accountbalancesService.findwallettotalsaldo(iduser);
            totalsaldo = databalance[0].totalsaldo;

        } catch (e) {
            databalance = null;
            totalsaldo = 0;
        }

        try {
            datasettingbankvercharge = await this.settingsService.findOne(idbankverificationcharge);
            valuebankcharge = datasettingbankvercharge._doc.value;
            datasettingdisbvercharge = await this.settingsService.findOne(idBankDisbursmentCharge);
            valuedisbcharge = datasettingdisbvercharge._doc.value;

        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }

        try {
            databank = await this.banksService.findbankcode(recipient_bank);
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarek = await this.userbankaccountsService.findnorek(recipient_account, idbank);
            var idbankaccount = datarek._doc._id;
            norekdb = datarek._doc.noRek;
            namarek = datarek._doc.nama;
            statusInquiry = datarek._doc.statusInquiry;

        } catch (e) {
            norekdb = null;
        }
        if (amounreq > totalsaldo) {
            throw new BadRequestException("The balance is not sufficient...!");
        } else {
            if (norekdb !== null) {

                let datareqinquiry = new OyAccountInquirys();
                datareqinquiry.bank_code = recipient_bank;
                datareqinquiry.account_number = recipient_account;
                nama = namarek.toLowerCase();
                let datareqinq = await this.oyPgService.inquiryAccount(datareqinquiry);
                var statuscode = datareqinq.status.code;
                var account_name = datareqinq.account_name;
                var namaakun = account_name.toLowerCase();


                if (statuscode === "000") {

                    if (nama === namaakun) {
                        await this.userbankaccountsService.updateone(idbankaccount, "success inquiry");
                        await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                        let datadisbursemen = await this.oyPgService.disbursement(OyDisbursements);
                        var statusdisb = datadisbursemen.status.code;
                        var dtburs = new Date(datadisbursemen.timestamp);
                        dtburs.setHours(dtburs.getHours() + 7); // timestamp
                        dtburs = new Date(dtburs);
                        if (statusdisb === "101") {
                            await this.accontbalanceWithdraw(iduser, valuedisbcharge, "withdraw");
                            let datawithdraw = new CreateWithdraws();
                            datawithdraw.amount = datadisbursemen.amount;
                            datawithdraw.bankVerificationCharge = mongoose.Types.ObjectId(idbankverificationcharge);
                            datawithdraw.bankDisbursmentCharge = mongoose.Types.ObjectId(idBankDisbursmentCharge);
                            datawithdraw.description = OyDisbursements.note;
                            datawithdraw.idUser = iduser;
                            datawithdraw.status = datadisbursemen.status.message;
                            datawithdraw.timestamp = dtburs.toISOString();
                            datawithdraw.verified = false;
                            datawithdraw.statusOtp = null;
                            var data = await this.withdrawsService.create(datawithdraw);
                            await this.accontbalanceWithdraw(iduser, datadisbursemen.amount, "withdraw");

                            res.status(HttpStatus.OK).json({
                                response_code: 202,
                                "data": data,
                                "message": messages
                            });
                        }


                    } else {
                        await this.userbankaccountsService.updateone(idbankaccount, "failed inquiry");
                        await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "message": "failed inquiry"
                        });

                    }
                }
                else {
                    throw new BadRequestException("data not found");
                }

            }
            else {
                throw new BadRequestException("Data not found...!");
            }
        }


    }

    @Post('api/callback/disbursement')
    async callbackDisbursement(@Body() payload: OyDisburseCallbacks) {

        console.log(payload);

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

    async pph(idtransaction: Types.ObjectId, idusersell: { oid: string }, amount: number, postid: string) {

        var datapphlast = null;
        let currentYear = new Date().getFullYear();
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var usersell = mongoose.Types.ObjectId(idusersell);
        var ttlincomelast = 0;
        var settingid = null;
        var datasettingpph = null;
        var max = 0;
        var min = 0;
        var valuepersen = 0;
        try {
            datapphlast = await this.pph21sService.finduseryear(usersell, currentYear);
            ttlincomelast = datapphlast[0].totalincome;
            settingid = datapphlast[0].settingId;
            datasettingpph = await this.settingsService.findOne(settingid);
            max = datasettingpph._doc.Max;
            min = datasettingpph._doc.Min;
            valuepersen = datasettingpph._doc.value;

        } catch (e) {
            datapphlast = null;
            ttlincomelast = 0;
            settingid = null;
            datasettingpph = null;
            max = 0;
            min = 0;
            valuepersen = 0;
        }



        if (ttlincomelast > 0) {
            var idtransaction = idtransaction;
            var amountsnew = amount / 2;
            var datapost = null;
            var desccontent = "";
            try {
                datapost = await this.postsService.findid(postid);

                desccontent = datapost._doc.description;


            } catch (e) {
                datapost = null;
                desccontent = "";
            }

            var jumlahincome = ttlincomelast + amountsnew;

            var a = 60000000; var persenA = 5; var idsettA = mongoose.Types.ObjectId("62bd4449ef6e0000af0068d3");
            var b = 250000000; var persenB = 15; var idsettB = mongoose.Types.ObjectId("62bd4824ef6e0000af0068d4");
            var c = 500000000; var persenC = 25; var idsettC = mongoose.Types.ObjectId("62bd4836ef6e0000af0068d5");
            var d = 5000000000; var persenD = 30; var idsettD = mongoose.Types.ObjectId("62bd4900ef6e0000af0068d6");
            var e = 5000000001; var persenE = 35; var idsettE = mongoose.Types.ObjectId("62bd4995ef6e0000af0068d7");

            var totalpph = 0;

            if (jumlahincome > max && max == a) {
                var tincomenew = max - ttlincomelast;
                var amounts = tincomenew;
                totalpph = amounts * persenA / 100;

                var datas = {
                    settingId: settingid,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenA + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }

                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenA + " % dari " + amounts,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                var tincomenew = max - ttlincomelast;
                var amounts = amountsnew - tincomenew;

                if (amounts > b && jumlahincome > d) {
                    totalpph = amounts * persenB / 100;

                    var datas = {
                        settingId: idsettB,
                        transactionId: idtransaction,
                        income: b - max,
                        totalincome: b,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenB + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenB + " % dari " + (b - max),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (c - b) * persenC / 100;

                    var datas = {
                        settingId: idsettC,
                        transactionId: idtransaction,
                        income: c - b,
                        totalincome: c,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenC + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenC + " % dari " + (c - b),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);


                    totalpph = (d - c) * persenD / 100;

                    var datas = {
                        settingId: idsettD,
                        transactionId: idtransaction,
                        income: d - c,
                        totalincome: d,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenD + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenD + " % dari " + (d - c),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (jumlahincome - d) * persenE / 100;

                    var datas = {
                        settingId: idsettE,
                        transactionId: idtransaction,
                        income: jumlahincome - d,
                        totalincome: jumlahincome,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenE + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenE + " % dari " + (jumlahincome - d),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }
                else if (amounts > b && jumlahincome < d) {
                    totalpph = amounts * persenB / 100;

                    var datas = {
                        settingId: idsettB,
                        transactionId: idtransaction,
                        income: b - max,
                        totalincome: b,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenB + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenB + " % dari " + (b - max),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (c - b) * persenC / 100;

                    var datas = {
                        settingId: idsettC,
                        transactionId: idtransaction,
                        income: c - b,
                        totalincome: c,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenC + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);

                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenC + " % dari " + (c - b),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (jumlahincome - c) * persenD / 100;

                    var datas = {
                        settingId: idsettD,
                        transactionId: idtransaction,
                        income: jumlahincome - c,
                        totalincome: jumlahincome,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenD + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenD + " % dari " + (jumlahincome - c),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                }
                else {
                    totalpph = amounts * persenA / 100;

                    var datas = {
                        settingId: idsettA,
                        transactionId: idtransaction,
                        income: amounts,
                        totalincome: ttlincomelast + amountsnew,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenA + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }


                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenA + " % dari " + (amounts),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }

            }
            else if (jumlahincome < max && max == a) {
                var tincomenew = jumlahincome - ttlincomelast;
                var amounts = tincomenew;

                totalpph = amounts * persenA / 100;

                var datas = {
                    settingId: idsettA,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: ttlincomelast + amountsnew,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenA + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenA + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);


            }
            else if (jumlahincome > max && max == b) {
                var tincomenew = max - ttlincomelast;
                var amounts = tincomenew;
                totalpph = amounts * persenB / 100;

                var datas = {
                    settingId: settingid,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: b,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenB + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenB + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                var tincomenew = max - ttlincomelast;
                var amounts = amountsnew - tincomenew;

                if (amounts > c) {
                    totalpph = amounts * persenC / 100;

                    var datas = {
                        settingId: idsettC,
                        transactionId: idtransaction,
                        income: c - max,
                        totalincome: c,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenC + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenC + " % dari " + (c - max),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (d - c) * persenD / 100;

                    var datas = {
                        settingId: idsettD,
                        transactionId: idtransaction,
                        income: d - c,
                        totalincome: d,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenD + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);

                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenD + " % dari " + (d - c),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (jumlahincome - c - d) * persenE / 100;

                    var datas = {
                        settingId: idsettE,
                        transactionId: idtransaction,
                        income: jumlahincome - c - d,
                        totalincome: jumlahincome,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenE + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenE + " % dari " + (jumlahincome - c - d),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }
                else {
                    totalpph = amounts * persenC / 100;

                    var datas = {
                        settingId: idsettC,
                        transactionId: idtransaction,
                        income: amounts,
                        totalincome: ttlincomelast + amountsnew,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenC + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }


                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenC + " % dari " + (amounts),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }

            }
            else if (jumlahincome > max && max == c) {
                var tincomenew = max - ttlincomelast;
                var amounts = tincomenew;
                totalpph = amounts * persenC / 100;

                var datas = {
                    settingId: settingid,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: c,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenC + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenC + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                var tincomenew = max - ttlincomelast;
                var amounts = amountsnew - tincomenew;

                if (amounts > d) {
                    totalpph = amounts * persenD / 100;

                    var datas = {
                        settingId: idsettD,
                        transactionId: idtransaction,
                        income: d - max,
                        totalincome: d,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenD + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenD + " % dari " + (d - max),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);

                    totalpph = (jumlahincome - d) * persenE / 100;

                    var datas = {
                        settingId: idsettE,
                        transactionId: idtransaction,
                        income: jumlahincome - d,
                        totalincome: jumlahincome,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenE + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenE + " % dari " + (jumlahincome - d),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }
                else {
                    totalpph = amounts * persenD / 100;

                    var datas = {
                        settingId: idsettD,
                        transactionId: idtransaction,
                        income: amounts,
                        totalincome: ttlincomelast + amountsnew,
                        Year: currentYear,
                        TimeStamp: dt.toISOString(),
                        Desc: "PPH " + persenD + " %",
                        userid: idusersell,
                        PphAmount: totalpph
                    }
                    await this.pph21sService.createdata(datas);
                    var dataacountbalance = {
                        iduser: idusersell,
                        debet: totalpph,
                        kredit: 0,
                        type: "PPH",
                        timestamp: dt.toISOString(),
                        description: "PPH " + persenD + " % dari " + (amounts),

                    };

                    await this.accountbalancesService.createdata(dataacountbalance);
                }


            }
            else if (jumlahincome < max && max == c) {

                var amounts = amountsnew;
                totalpph = amounts * persenC / 100;

                var datas = {
                    settingId: idsettC,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: amounts + ttlincomelast,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenC + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenC + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);


            }
            else if (jumlahincome > max && max == d) {
                var tincomenew = max - ttlincomelast;
                var amounts = tincomenew;
                totalpph = amounts * persenD / 100;

                var datas = {
                    settingId: settingid,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: d,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenD + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenD + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                var tincomenew = max - ttlincomelast;
                var amounts = amountsnew - tincomenew;
                totalpph = amounts * persenE / 100;

                var datas = {
                    settingId: idsettE,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: ttlincomelast + amountsnew,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenE + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenE + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

            }
            else if (jumlahincome < max && max == d) {

                var amounts = amountsnew;
                totalpph = amounts * persenD / 100;

                var datas = {
                    settingId: idsettD,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: amounts + ttlincomelast,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenD + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenD + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

            }
            else if (jumlahincome > max && max > e) {
                var tincomenew = max - ttlincomelast;
                var amounts = tincomenew;
                totalpph = amounts * persenE / 100;

                var datas = {
                    settingId: settingid,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: e,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH " + persenE + " %",
                    userid: idusersell,
                    PphAmount: totalpph
                }
                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH " + persenE + " % dari " + (amounts),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

            }

        }
        else {
            var idtransaction = idtransaction;
            var amounts = amount / 2;
            var totalamounts = amounts;


            var dt = new Date(Date.now());
            var a = 60000000; var persenA = 5; var idsettA = mongoose.Types.ObjectId("62bd4449ef6e0000af0068d3");
            var b = 250000000; var persenB = 15; var idsettB = mongoose.Types.ObjectId("62bd4824ef6e0000af0068d4");
            var c = 500000000; var persenC = 25; var idsettC = mongoose.Types.ObjectId("62bd4836ef6e0000af0068d5");
            var d = 5000000000; var persenD = 30; var idsettD = mongoose.Types.ObjectId("62bd4900ef6e0000af0068d6");
            var e = 5000000001; var persenE = 35; var idsettE = mongoose.Types.ObjectId("62bd4995ef6e0000af0068d7");
            var pengurangan = 0;
            var totalpph = 0;

            var penguranganA = amounts - a;
            var penguranganB = penguranganA - b;
            var penguranganC = penguranganB - c;
            var penguranganD = penguranganC - d;
            var penguranganE = penguranganD - e;
            if (penguranganA <= 0) {

                totalpph = amounts * persenA / 100;

                var datas = {
                    settingId: idsettA,
                    transactionId: idtransaction,
                    income: amounts,
                    totalincome: amounts,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 5 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);

                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 5 % dari " + amounts,

                };

                await this.accountbalancesService.createdata(dataacountbalance);


            }

            else if (penguranganA > 0 && penguranganA <= b) {
                totalpph = a * persenA / 100;

                var datas = {
                    settingId: idsettA,
                    transactionId: idtransaction,
                    income: a,
                    totalincome: a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 5 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);

                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 5 % dari " + a,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = penguranganA * persenB / 100;

                var datas = {
                    settingId: idsettB,
                    transactionId: idtransaction,
                    income: penguranganA,
                    totalincome: amounts,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 15 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 15 % dari " + penguranganA,

                };

                await this.accountbalancesService.createdata(dataacountbalance);


            }

            else if (penguranganB > 0 && penguranganB <= c) {
                totalpph = a * persenA / 100;

                var datas = {
                    settingId: idsettA,
                    transactionId: idtransaction,
                    income: a,
                    totalincome: a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 5 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);

                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 5 % dari " + a,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = b * persenB / 100;

                var datas = {
                    settingId: idsettB,
                    transactionId: idtransaction,
                    income: b,
                    totalincome: b + a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 15 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 15 % dari " + b,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = penguranganB * persenC / 100;

                var datas = {
                    settingId: idsettC,
                    transactionId: idtransaction,
                    income: penguranganB,
                    totalincome: amounts,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 25 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 25 % dari " + penguranganB,

                };

                await this.accountbalancesService.createdata(dataacountbalance);


            }

            else if (penguranganC > 0 && penguranganC <= d) {
                totalpph = a * persenA / 100;

                var datas = {
                    settingId: idsettA,
                    transactionId: idtransaction,
                    income: a,
                    totalincome: a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 5 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 5 % dari " + a,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = b * persenB / 100;

                var datas = {
                    settingId: idsettB,
                    transactionId: idtransaction,
                    income: b,
                    totalincome: b + a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 15 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }

                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 15 % dari " + b,

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = c * persenC / 100;

                var datas = {
                    settingId: idsettC,
                    transactionId: idtransaction,
                    income: c,
                    totalincome: c + b + a,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 25 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 25 % dari " + c,

                };

                await this.accountbalancesService.createdata(dataacountbalance);



                totalpph = (d - a - b - c) * persenD / 100;

                var datas = {
                    settingId: idsettD,
                    transactionId: idtransaction,
                    income: (d - a - b - c),
                    totalincome: d,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 30 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 30 % dari " + (d - a - b - c),

                };

                await this.accountbalancesService.createdata(dataacountbalance);

                totalpph = (amounts - d) * persenE / 100;

                var datas = {
                    settingId: idsettE,
                    transactionId: idtransaction,
                    income: amounts - d,
                    totalincome: amounts,
                    Year: currentYear,
                    TimeStamp: dt.toISOString(),
                    Desc: "PPH 35 %",
                    userid: idusersell,
                    PphAmount: totalpph
                }


                await this.pph21sService.createdata(datas);
                var dataacountbalance = {
                    iduser: idusersell,
                    debet: totalpph,
                    kredit: 0,
                    type: "PPH",
                    timestamp: dt.toISOString(),
                    description: "PPH 35 % dari " + (amounts - d)

                };

                await this.accountbalancesService.createdata(dataacountbalance);

            }


        }

    }
    async accontbalance(postid: string, idusersell: { oid: string }, amount: number) {
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datapost = null;
        var desccontent = "";
        try {
            datapost = await this.postsService.findid(postid);

            desccontent = datapost._doc.description;


        } catch (e) {
            datapost = null;
            desccontent = "";
        }
        var dataacountbalance = {
            iduser: idusersell,
            debet: 0,
            kredit: amount,
            type: "sell",
            timestamp: dt.toISOString(),
            description: "sell content " + desccontent,

        };

        await this.accountbalancesService.createdata(dataacountbalance);
    }

    async accontbalanceWithdraw(iduser: { oid: String }, amount: number, tipe: string) {
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var desccontent = "";

        if (tipe === "inquiry") {
            desccontent = "inquiry";
        } else if (tipe === "withdraw") {
            desccontent = "withdraw";
        }

        var dataacountbalance = {
            iduser: iduser,
            debet: amount,
            kredit: 0,
            type: tipe,
            timestamp: dt.toISOString(),
            description: desccontent,

        };

        await this.accountbalancesService.createdata(dataacountbalance);
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
}

