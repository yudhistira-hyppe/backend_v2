import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, BadRequestException, HttpStatus, Put, Headers, Req, NotAcceptableException, HttpCode } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionsDto, CreateWithdraws, OyAccountInquirys, OyDisburseCallbacks, OyDisbursements, OyDisbursementStatus2, Uservoucher, VaCallback } from './dto/create-transactions.dto';
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
import mongoose, { Types } from 'mongoose';
import { GetusercontentsService } from '../getusercontents/getusercontents.service';
import { UservouchersService } from '../uservouchers/uservouchers.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { post } from 'jquery';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { PostContentService } from '../../content/posts/postcontent.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { CreateUserplaylistDto } from '../userplaylist/dto/create-userplaylist.dto';
import { LanguagesService } from '../../infra/languages/languages.service';
import { ignoreElements } from 'rxjs';
import { AdsService } from '../ads/ads.service';
import { BoostsessionService } from '../../content/boostsession/boostsession.service';
import { BoostintervalService } from '../../content/boostinterval/boostinterval.service';
import { TemplatesRepo } from '../../infra/templates_repo/schemas/templatesrepo.schema';
import { CreatePostsDto } from 'src/content/posts/dto/create-posts.dto';
import { Accountbalances } from '../accountbalances/schemas/accountbalances.schema';
import { Templates } from 'src/infra/templates/schemas/templates.schema';

const cheerio = require('cheerio');
const nodeHtmlToImage = require('node-html-to-image');
@Controller()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly settingsService: SettingsService,
        private readonly methodepaymentsService: MethodepaymentsService,
        private readonly banksService: BanksService,
        private readonly postsService: PostsService,
        private readonly boostintervalService: BoostintervalService,
        private readonly boostsessionService: BoostsessionService,
        private readonly pph21sService: Pph21sService,
        private readonly accountbalancesService: AccountbalancesService,
        private readonly oyPgService: OyPgService,
        private readonly insightsService: InsightsService,
        private readonly userbankaccountsService: UserbankaccountsService,
        private readonly withdrawsService: WithdrawsService,
        private readonly getusercontentsService: GetusercontentsService,
        private readonly uservouchersService: UservouchersService,
        private readonly vouchersService: VouchersService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly postContentService: PostContentService,
        private readonly mediadiariesService: MediadiariesService,
        private readonly mediastoriesService: MediastoriesService,
        private readonly mediavideosService: MediavideosService,
        private readonly mediapictsService: MediapictsService,
        private readonly languagesService: LanguagesService,
        private readonly adsService: AdsService,
    ) { }
    @UseGuards(JwtAuthGuard)
    @Post('api/transactions')
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Headers('x-auth-user') email: string, @Body() CreateTransactionsDto: CreateTransactionsDto, @Request() request) {
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
        var type = null;
        var detail = null;
        var arrayPostId = [];
        var postidTR = null;
        var qty = null;


        var titleinsukses = "Selamat";
        var titleensukses = "Congratulations";
        var bodyinsukses = "Silakan selesaikan pembayaran Anda Klik Di Sini untuk Melihat";
        var bodyensukses = "Please complete your payment Click Here to View";
        var eventType = "TRANSACTION";
        var event = "TRANSACTION";

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

        //var splitPostid = postid.split(',');
        var lenghtpostid = postid.length;

        salelike = request_json["salelike"];
        saleview = request_json["saleview"];
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

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        detail = request_json["detail"];
        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);
        var datatrpending = null;
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;

        var totalamount = 0;
        var email = email;

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
        var dataconten = null;
        var saleAmount = 0;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var datapost = null;
        var emailseller = null;
        var ubasicseller = null;
        var iduserseller = null;
        var namapenjual = null;
        var arraypostids = [];
        var arraymount = [];
        var arrayDetail = [];
        var datavoucher = null;
        var datasettingppn = null;
        var datamradmin = null;
        var databankvacharge = null;
        var datasettingexpiredva = null;
        var transactionVoucher = null;
        var datamradmin = null;
        var databankvacharge = null;
        var idppn = "62bbbe43a7520000050077a3";
        //  var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvacharge = "62bd40e0f37a00001a004366";
        var idexpiredva = "62bbbe8ea7520000050077a4";
        try {
            //  datasettingppn = await this.settingsService.findOne(idppn);
            //  datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);

            //var valueppn = datasettingppn._doc.value;
            // var nominalppn = amount * valueppn / 100;
            var valuevacharge = databankvacharge._doc.value;
            // var valuemradmin = datamradmin._doc.value;
            // var nominalmradmin = amount * valuemradmin / 100;

            //var prosentase = valueppn + valuemradmin;
            // var calculate = amount * prosentase / 100;
            totalamount = amount;



        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
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


        try {
            // datasettingppn = await this.settingsService.findOne(idppn);
            // datamradmin = await this.settingsService.findOne(idmdradmin);
            databankvacharge = await this.settingsService.findOne(idbankvacharge);
            datasettingexpiredva = await this.settingsService.findOne(idexpiredva);
            // var valueppn = datasettingppn._doc.value;
            var valuevacharge = databankvacharge._doc.value;
            // var valuemradmin = datamradmin._doc.value;
            var valueexpiredva = datasettingexpiredva._doc.value;

        } catch (e) {
            throw new BadRequestException("Setting value not found..!");
        }

        var userbuy = iduser;
        var name = ubasic.fullName;
        var emailbuy = ubasic.email;
        var stringId = (await this.generateNumber()).toString();


        if (type === "CONTENT") {
            try {
                datapost = await this.postsService.findid(postid[0].id);

                emailseller = datapost._doc.email;
                ubasicseller = await this.userbasicsService.findOne(emailseller);
                iduserseller = ubasicseller._id;
                namapenjual = ubasicseller.fullName;

            } catch (e) {
                throw new BadRequestException("User not found..!");
            }

            try {

                dataconten = await this.getusercontentsService.findcontenbuy(postid[0].id);
                saleAmount = dataconten[0].saleAmount;
            } catch (e) {
                dataconten = null;
                saleAmount = 0;
            }

            try {

                datatrpending = await this.transactionsService.findpostidpending(postid[0].id);


            } catch (e) {
                datatrpending = null;

            }


            var postIds = postid[0].id;

            //  var objid = mongoose.Types.ObjectId(postIds);
            var qty = postid[0].qty;
            var totalAmount = postid[0].totalAmount;
            var arraydetailobj = { "id": postIds, "qty": qty, "totalAmount": totalAmount };
            arrayDetail.push(arraydetailobj);

            postidTR = postIds;
            arraypostids.push(postid[0].id);


            if (datatrpending !== null) {

                let cekstatusva = await this.oyPgService.staticVaInfo(datatrpending.idva);
                var expiredva = cekstatusva.trx_expiration_time;
                var dex = new Date(expiredva);
                dex.setHours(dex.getHours() + 7); // timestamp
                dex = new Date(dex);

                if (cekstatusva.va_status === "WAITING_PAYMENT") {
                    throw new BadRequestException("Tidak dapat melanjutkan. Konten ini sedang dalam proses pembelian");
                }
                else if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {


                    // var datenow = new Date(Date.now());
                    // var expiredvas = dex;
                    // var dateVa = new Date(expiredvas);
                    // dateVa.setHours(dateVa.getHours() - 7); // timestamp


                    var idtransaction = datatrpending._id;

                    // if (datenow > dateVa) {

                    var datava = {
                        "partner_user_id": userbuy.toString() + stringId,
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
                        var datareqva = await this.oyPgService.generateStaticVa(datava);
                        var idva = datareqva.id;
                        var statuscodeva = datareqva.status.code;
                        var statusmessage = datareqva.status.message;
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

                            let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                            CreateTransactionsDto.iduserbuyer = iduser;
                            CreateTransactionsDto.idusersell = iduserseller;
                            CreateTransactionsDto.timestamp = dt.toISOString();
                            CreateTransactionsDto.updatedAt = dt.toISOString();
                            CreateTransactionsDto.noinvoice = no;
                            CreateTransactionsDto.amount = saleAmount;
                            CreateTransactionsDto.status = cekstatusva.va_status;
                            CreateTransactionsDto.bank = idbank;
                            CreateTransactionsDto.idva = idva;
                            CreateTransactionsDto.nova = nova;
                            CreateTransactionsDto.accountbalance = null;
                            CreateTransactionsDto.paymentmethod = idmethode;
                            // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                            CreateTransactionsDto.ppn = null;
                            CreateTransactionsDto.totalamount = totalamount;
                            CreateTransactionsDto.description = "buy " + type + " pending";
                            CreateTransactionsDto.payload = null;
                            CreateTransactionsDto.expiredtimeva = d1.toISOString();
                            CreateTransactionsDto.detail = arrayDetail;
                            CreateTransactionsDto.postid = postidTR;
                            CreateTransactionsDto.response = datareqva;
                            let datatr = await this.transactionsService.create(CreateTransactionsDto);
                            await this.utilsService.sendFcm(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                            await this.transactionsService.updatestatuscancel(idtransaction);


                            var data = {
                                "noinvoice": datatr.noinvoice,
                                "postid": postidTR,
                                "idusersell": datatr.idusersell,
                                "NamaPenjual": namapenjual,
                                "iduserbuyer": datatr.iduserbuyer,
                                "NamaPembeli": namapembeli,
                                "amount": datatr.amount,
                                "paymentmethod": namamethode,
                                "status": datatr.status,
                                "description": datatr.description,
                                "idva": datatr.idva,
                                "nova": datatr.nova,
                                "expiredtimeva": datatr.expiredtimeva,
                                "salelike": datatr.saleview,
                                "saleview": datatr.salelike,
                                "bank": namabank,
                                // "ppn": valueppn + " %",
                                // "nominalppn": nominalppn,
                                "bankvacharge": valuevacharge,
                                // "mdradmin": valuemradmin + " %",
                                // "nominalmdradmin": nominalmradmin,
                                "detail": arrayDetail,
                                "totalamount": datatr.totalamount,
                                "accountbalance": datatr.accountbalance,
                                "timestamp": datatr.timestamp,
                                "_id": datatr._id
                            };


                        } catch (e) {
                            res.status(HttpStatus.BAD_REQUEST).json({

                                "message": messagesEror + " " + e.toString()
                            });
                        }
                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "data": data,
                            "message": messages
                        });
                        // setTimeout(res, 3000);
                    }
                    else if (statuscodeva == "208") {
                        throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                    }
                    else if (statuscodeva == "217") {
                        throw new BadRequestException("Request is Rejected (VA Number is still active for this partner user id)");
                    }
                    else {
                        throw new BadRequestException("Request is Rejected");
                    }
                    // } else {
                    //     throw new BadRequestException("This content is already in the process of being purchased");
                    // }
                }



            }
            else {

                var datava = {
                    "partner_user_id": userbuy.toString() + stringId,
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
                    var datareqva = await this.oyPgService.generateStaticVa(datava);
                    var idva = datareqva.id;
                    var statuscodeva = datareqva.status.code;
                    var statusmessage = datareqva.status.message;
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

                        let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                        CreateTransactionsDto.iduserbuyer = iduser;
                        CreateTransactionsDto.idusersell = iduserseller;
                        CreateTransactionsDto.timestamp = dt.toISOString();
                        CreateTransactionsDto.updatedAt = dt.toISOString();
                        CreateTransactionsDto.noinvoice = no;
                        CreateTransactionsDto.amount = saleAmount;
                        CreateTransactionsDto.status = cekstatusva.va_status;
                        CreateTransactionsDto.bank = idbank;
                        CreateTransactionsDto.idva = idva;
                        CreateTransactionsDto.nova = nova;
                        CreateTransactionsDto.accountbalance = null;
                        CreateTransactionsDto.paymentmethod = idmethode;
                        // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                        CreateTransactionsDto.ppn = null;
                        CreateTransactionsDto.totalamount = totalamount;
                        CreateTransactionsDto.description = "buy " + type + " pending";
                        CreateTransactionsDto.payload = null;
                        CreateTransactionsDto.expiredtimeva = d1.toISOString();
                        CreateTransactionsDto.detail = arrayDetail;
                        CreateTransactionsDto.postid = postidTR;
                        CreateTransactionsDto.response = datareqva;
                        let datatr = await this.transactionsService.create(CreateTransactionsDto);
                        await this.utilsService.sendFcm(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);

                        var data = {
                            "noinvoice": datatr.noinvoice,
                            "postid": postidTR,
                            "idusersell": datatr.idusersell,
                            "NamaPenjual": namapenjual,
                            "iduserbuyer": datatr.iduserbuyer,
                            "NamaPembeli": namapembeli,
                            "amount": datatr.amount,
                            "paymentmethod": namamethode,
                            "status": datatr.status,
                            "description": datatr.description,
                            "idva": datatr.idva,
                            "nova": datatr.nova,
                            "expiredtimeva": datatr.expiredtimeva,
                            "salelike": datatr.saleview,
                            "saleview": datatr.salelike,
                            "bank": namabank,
                            // "ppn": valueppn + " %",
                            // "nominalppn": nominalppn,
                            "bankvacharge": valuevacharge,
                            // "mdradmin": valuemradmin + " %",
                            // "nominalmdradmin": nominalmradmin,
                            "detail": arrayDetail,
                            "totalamount": datatr.totalamount,
                            "accountbalance": datatr.accountbalance,
                            "timestamp": datatr.timestamp,
                            "_id": datatr._id
                        };
                    } catch (e) {
                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": messagesEror + " " + e.toString()
                        });
                    }
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                    // setTimeout(res, 3000);
                }
                else if (statuscodeva == "208") {
                    throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                }
                else if (statuscodeva == "217") {
                    throw new BadRequestException("Request is Rejected (VA Number is still active for this partner user id)");
                }
                else {
                    throw new BadRequestException("Request is Rejected");
                }
            }

        }
        else if (type === "VOUCHER") {

            var postidTRvoucer = null;
            var arraymountvc = [];
            var arraypostidsvc = [];
            var arrayDetailvc = [];
            try {


                emailseller = "tjikaljedy@hyppe.id";
                ubasicseller = await this.userbasicsService.findOne(emailseller);
                iduserseller = ubasicseller._id;
                namapenjual = ubasicseller.fullName;


            } catch (e) {
                throw new BadRequestException("User not found..!");
            }
            try {

                datatrpending = await this.transactionsService.findpostidpendingVoucer();

            } catch (e) {
                datatrpending = null;

            }

            try {

                var sum = 0;
                for (var i = 0; i < lenghtpostid; i++) {
                    var postIds = postid[i].id;

                    var objid = mongoose.Types.ObjectId(postIds);
                    var qty = postid[i].qty;


                    var totalAmount = postid[i].totalAmount;
                    dataconten = await this.vouchersService.findOne(postIds);
                    var qtyvoucher = dataconten.qty;
                    var tusedvoucher = dataconten.totalUsed;
                    var codeVoucher = dataconten.codeVoucher;
                    var pendingUsed = dataconten.pendingUsed;
                    var totalUsePending = tusedvoucher + pendingUsed;

                    if (qty >= qtyvoucher) {
                        res.status(HttpStatus.BAD_REQUEST).json({
                            "message": "Maaf quantity Voucher melebihi quota.."
                        });
                        process.exit(0);
                    }
                    else if (totalUsePending === qtyvoucher) {
                        res.status(HttpStatus.BAD_REQUEST).json({
                            "message": "Maaf Voucher " + codeVoucher + " quota sudah habis.."
                        });
                        process.exit(0);
                    } else {
                        var amountobj = dataconten.amount * qty;
                        arraymountvc.push(amountobj);
                        arraypostidsvc.push(postIds);

                        var arraydetailobj = { "id": objid, "qty": qty, "totalAmount": totalAmount };
                        arrayDetailvc.push(arraydetailobj);
                    }
                }

                for (var i = 0; i < arraymountvc.length; i++) {
                    sum += arraymountvc[i];
                }

                saleAmount = sum;
            } catch (e) {
                dataconten = null;
                saleAmount = 0;
            }

            postidTRvoucer = arraypostidsvc.toString();
            console.log(postidTRvoucer)

            if (datatrpending !== null) {

                let cekstatusva = await this.oyPgService.staticVaInfo(datatrpending.idva);
                var expiredva = cekstatusva.trx_expiration_time;
                var dex = new Date(expiredva);
                dex.setHours(dex.getHours() + 7); // timestamp
                dex = new Date(dex);

                if (cekstatusva.va_status === "WAITING_PAYMENT") {
                    throw new BadRequestException("Tidak dapat melanjutkan. Voucher ini sedang dalam proses pembelian");
                }
                else if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {
                    var idtransaction = datatrpending._id;
                    var datava = {
                        "partner_user_id": userbuy.toString() + stringId,
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
                        var datareqva = await this.oyPgService.generateStaticVa(datava);
                        var idva = datareqva.id;
                        var statuscodeva = datareqva.status.code;
                        var statusmessage = datareqva.status.message;
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

                            let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                            CreateTransactionsDto.iduserbuyer = iduser;
                            CreateTransactionsDto.idusersell = iduserseller;
                            CreateTransactionsDto.timestamp = dt.toISOString();
                            CreateTransactionsDto.updatedAt = dt.toISOString();
                            CreateTransactionsDto.noinvoice = no;
                            CreateTransactionsDto.amount = saleAmount;
                            CreateTransactionsDto.status = cekstatusva.va_status;
                            CreateTransactionsDto.bank = idbank;
                            CreateTransactionsDto.idva = idva;
                            CreateTransactionsDto.nova = nova;
                            CreateTransactionsDto.accountbalance = null;
                            CreateTransactionsDto.paymentmethod = idmethode;
                            // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                            CreateTransactionsDto.ppn = null;
                            CreateTransactionsDto.totalamount = totalamount;
                            CreateTransactionsDto.description = "buy " + type + " pending";
                            CreateTransactionsDto.payload = null;
                            CreateTransactionsDto.expiredtimeva = d1.toISOString();
                            CreateTransactionsDto.detail = arrayDetailvc;
                            CreateTransactionsDto.postid = postidTRvoucer.toString();
                            CreateTransactionsDto.response = datareqva;
                            let datatr = await this.transactionsService.create(CreateTransactionsDto);

                            var lengArrDetail = arrayDetailvc.length;

                            for (var i = 0; i < lengArrDetail; i++) {
                                let qtyDetail = arrayDetailvc[i].qty;
                                let idvoucher = arrayDetailvc[i].id.toString();
                                let idvcr = mongoose.Types.ObjectId(idvoucher);
                                datavoucher = await this.vouchersService.findOne(idvoucher);
                                let pendingUsed = datavoucher.pendingUsed;
                                let totalPending = pendingUsed + qtyDetail;
                                await this.vouchersService.updatesPendingUsed(idvcr, totalPending);
                            }

                            await this.transactionsService.updatestatuscancel(idtransaction);
                            transactionVoucher = await this.transactionsService.findid(idtransaction.toString());


                            var detailTr = transactionVoucher.detail;
                            for (var a = 0; a < detailTr.length; a++) {
                                var qtyDetail2 = detailTr[a].qty;
                                var idvoucher2 = detailTr[a].id.toString();
                                var idvcr2 = detailTr[a].id;
                                datavoucher = await this.vouchersService.findOne(idvoucher2);
                                var pendingUsed2 = datavoucher.pendingUsed;
                                var totalPending2 = pendingUsed2 - qtyDetail2;
                                await this.vouchersService.updatesPendingUsed(idvcr2, totalPending2);
                            }

                            var data = {
                                "noinvoice": datatr.noinvoice,
                                "postid": postidTRvoucer.toString(),
                                "idusersell": datatr.idusersell,
                                "NamaPenjual": namapenjual,
                                "iduserbuyer": datatr.iduserbuyer,
                                "NamaPembeli": namapembeli,
                                "amount": datatr.amount,
                                "paymentmethod": namamethode,
                                "status": datatr.status,
                                "description": datatr.description,
                                "idva": datatr.idva,
                                "nova": datatr.nova,
                                "expiredtimeva": datatr.expiredtimeva,
                                "salelike": datatr.saleview,
                                "saleview": datatr.salelike,
                                "bank": namabank,
                                // "ppn": valueppn + " %",
                                // "nominalppn": nominalppn,
                                "bankvacharge": valuevacharge,
                                // "mdradmin": valuemradmin + " %",
                                // "nominalmdradmin": nominalmradmin,
                                "detail": arrayDetailvc,
                                "totalamount": datatr.totalamount,
                                "accountbalance": datatr.accountbalance,
                                "timestamp": datatr.timestamp,
                                "_id": datatr._id
                            };


                        } catch (e) {
                            res.status(HttpStatus.BAD_REQUEST).json({

                                "message": messagesEror + " " + e.toString()
                            });
                        }
                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "data": data,
                            "message": messages
                        });
                        // setTimeout(res, 3000);
                    }
                    else if (statuscodeva == "208") {
                        throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                    }
                    else if (statuscodeva == "217") {
                        throw new BadRequestException("Request is Rejected (VA Number is still active for this partner user id)");
                    }
                    else {
                        throw new BadRequestException("Request is Rejected");
                    }
                    // } else {
                    //     throw new BadRequestException("This content is already in the process of being purchased");
                    // }
                }



            }
            else {

                var datava = {
                    "partner_user_id": userbuy.toString() + stringId,
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
                    var datareqva = await this.oyPgService.generateStaticVa(datava);
                    var idva = datareqva.id;
                    var statuscodeva = datareqva.status.code;
                    var statusmessage = datareqva.status.message;
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

                        let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                        CreateTransactionsDto.iduserbuyer = iduser;
                        CreateTransactionsDto.idusersell = iduserseller;
                        CreateTransactionsDto.timestamp = dt.toISOString();
                        CreateTransactionsDto.updatedAt = dt.toISOString();
                        CreateTransactionsDto.noinvoice = no;
                        CreateTransactionsDto.amount = saleAmount;
                        CreateTransactionsDto.status = cekstatusva.va_status;
                        CreateTransactionsDto.bank = idbank;
                        CreateTransactionsDto.idva = idva;
                        CreateTransactionsDto.nova = nova;
                        CreateTransactionsDto.accountbalance = null;
                        CreateTransactionsDto.paymentmethod = idmethode;
                        // CreateTransactionsDto.ppn = mongoose.Types.ObjectId(idppn);
                        CreateTransactionsDto.ppn = null;
                        CreateTransactionsDto.totalamount = totalamount;
                        CreateTransactionsDto.description = "buy " + type + " pending";
                        CreateTransactionsDto.payload = null;
                        CreateTransactionsDto.expiredtimeva = d1.toISOString();
                        CreateTransactionsDto.detail = arrayDetailvc;
                        CreateTransactionsDto.postid = postidTRvoucer;
                        CreateTransactionsDto.response = datareqva;
                        let datatr = await this.transactionsService.create(CreateTransactionsDto);
                        await this.utilsService.sendFcm(emailbuy.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                        var lengArrDetail = arrayDetailvc.length;

                        for (var i = 0; i < lengArrDetail; i++) {
                            let qtyDetail = arrayDetailvc[i].qty;
                            let idvoucher = arrayDetailvc[i].id.toString();
                            let idvcr2 = arrayDetailvc[i].id;
                            datavoucher = await this.vouchersService.findOne(idvoucher);
                            let pendingUsed = datavoucher.pendingUsed;
                            let totalPending = pendingUsed + qtyDetail;
                            await this.vouchersService.updatesPendingUsed(idvcr2, totalPending);
                        }

                        var data = {
                            "noinvoice": datatr.noinvoice,
                            "postid": postidTRvoucer,
                            "idusersell": datatr.idusersell,
                            "NamaPenjual": namapenjual,
                            "iduserbuyer": datatr.iduserbuyer,
                            "NamaPembeli": namapembeli,
                            "amount": datatr.amount,
                            "paymentmethod": namamethode,
                            "status": datatr.status,
                            "description": datatr.description,
                            "idva": datatr.idva,
                            "nova": datatr.nova,
                            "expiredtimeva": datatr.expiredtimeva,
                            "salelike": datatr.saleview,
                            "saleview": datatr.salelike,
                            "bank": namabank,
                            // "ppn": valueppn + " %",
                            // "nominalppn": nominalppn,
                            "bankvacharge": valuevacharge,
                            // "mdradmin": valuemradmin + " %",
                            // "nominalmdradmin": nominalmradmin,
                            "detail": arrayDetailvc,
                            "totalamount": datatr.totalamount,
                            "accountbalance": datatr.accountbalance,
                            "timestamp": datatr.timestamp,
                            "_id": datatr._id
                        };

                    } catch (e) {
                        res.status(HttpStatus.BAD_REQUEST).json({

                            "message": messagesEror + " " + e.toString()
                        });
                    }

                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                    //  setTimeout(res, 3000);
                }
                else if (statuscodeva == "208") {
                    throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                }
                else if (statuscodeva == "217") {
                    throw new BadRequestException("Request is Rejected (VA Number is still active for this partner user id)");
                }
                else {
                    throw new BadRequestException("Request is Rejected");
                }
            }

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
        var bankcode = null;
        var nova = payload.va_number;
        var statussucces = payload.success;
        var datatransaksi = null;
        var datapost = null;
        var datainsight = null;
        var data_media = null;
        var iduseradmin = "61d9c847548ae516042f0b13";
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idadmin = mongoose.Types.ObjectId(iduseradmin);

        var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvachargeBCA = "63217919ec46000002007403";
        var idbankvachargeLainya = "6321796aec46000002007404";
        var idbank = null;
        var datamradmin = null;
        var datavabankbca = null;
        var datavabanklainya = null;
        var nominalmradmin = 0;
        var type = null;
        var salelike = null;
        var saleview = null;
        var expiredAt = null;
        var valuevaBCA = null;
        var valuevalainya = null;
        var databank = null;
        var amontVA = null;
        var languages = null;
        var idlanguages = null;
        var datalanguage = null;
        var langIso = null;
        var titleinsukses = "Selamat!";
        var titleensukses = "Congratulation!";
        var bodyinsukses = "Konten Anda Telah Terjual Saldo akan diteruskan ke akun hype Anda.";
        var bodyensukses = "Your Content Has Been Sold The balance will be forwarded to your Hyppe Account.";
        var eventType = "TRANSACTION";
        var event = "TRANSACTION";
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        try {

            datavabankbca = await this.settingsService.findOne(idbankvachargeBCA);
            valuevaBCA = datavabankbca._doc.value;


        } catch (e) {
            valuevaBCA = 0;
        }

        try {

            datavabanklainya = await this.settingsService.findOne(idbankvachargeLainya);
            valuevalainya = datavabanklainya._doc.value;


        } catch (e) {
            valuevalainya = 0;
        }
        if (statussucces == true) {

            try {

                datatransaksi = await this.transactionsService.findva(nova);
                idbank = datatransaksi.bank.toString();
                try {
                    databank = await this.banksService.findOne(idbank);
                    bankcode = databank._doc.bankcode;

                } catch (e) {
                    throw new BadRequestException("Banks not found...!");
                }
                type = datatransaksi.type;
                var idtransaction = datatransaksi._id;
                var postid = datatransaksi.postid;
                var idusersell = datatransaksi.idusersell;
                var iduserbuy = datatransaksi.iduserbuyer;
                var amount = datatransaksi.amount;
                var tamount = datatransaksi.totalamount;
                var status = datatransaksi.status;
                var detail = datatransaksi.detail;

                try {
                    salelike = datatransaksi.salelike;
                    saleview = datatransaksi.saleview;
                } catch (e) {
                    salelike = null;
                    saleview = null;
                }

                var lengtvoucherid = detail.length;

                if (type === "CONTENT") {
                    let databuy = await this.getusercontentsService.findcontenbuy(postid);

                    var saleAmount = databuy[0].saleAmount;
                    try {

                        datamradmin = await this.settingsService.findOne(idmdradmin);
                        var valuemradmin = datamradmin._doc.value;
                        nominalmradmin = Math.ceil(saleAmount * valuemradmin / 100);

                    } catch (e) {
                        nominalmradmin = 0;
                    }


                    amontVA = tamount - (amount + nominalmradmin);
                    var amounvaadmin = null;
                    if (bankcode === "014") {
                        amounvaadmin = amontVA - valuevaBCA;
                    } else {
                        amounvaadmin = amontVA - valuevalainya;
                    }

                    if (status == "WAITING_PAYMENT") {
                        var ubasic = await this.userbasicsService.findid(iduserbuy);
                        var emailbuyer = ubasic.email;
                        var ubasicsell = await this.userbasicsService.findid(idusersell);
                        var emailseller = ubasicsell.email;

                        try {
                            languages = ubasic.languages;
                            idlanguages = languages.oid.toString();
                            datalanguage = await this.languagesService.findOne(idlanguages)
                            langIso = datalanguage.langIso;

                            console.log(idlanguages)
                        } catch (e) {
                            languages = null;
                            idlanguages = "";
                            datalanguage = null;
                            langIso = "";
                        }


                        var createbalance = await this.accontbalance(postid, idusersell, saleAmount);
                        var createbalanceadmin = await this.accontbalanceAdmin("Admin", idadmin, idusersell, nominalmradmin);
                        var createbalanceadminVa = await this.accontbalanceAdmin("Bank VA", idadmin, idusersell, amounvaadmin);
                        let databalance = await this.accountbalancesService.findOne(idusersell);

                        var idbalance = databalance._id;
                        datainsight = await this.insightsService.findemail(emailbuyer.toString());
                        var idinsight = datainsight._id;
                        var likeinsig = datainsight.likes;
                        var viewinsigh = datainsight.views;
                        datapost = await this.postsService.findid(postid);
                        var postType = datapost.postType;
                        var like = datapost.likes;
                        var view = datapost.views;

                        //// var datapph = await this.pph(idtransaction, idusersell, amount, postid);


                        await this.transactionsService.updateone(idtransaction, idbalance, payload);
                        await this.utilsService.sendFcm(emailseller.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);


                        await this.postsService.updateemail(postid, emailbuyer.toString(), iduserbuy, dt.toISOString());
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


                        // if (postType == "vid") {
                        //     data_media = await this.mediavideosService.findOnepostID(postid);
                        // } else if (postType == "pict") {
                        //     data_media = await this.mediapictsService.findOnepostID(postid);
                        // } else if (postType == "diary") {
                        //     data_media = await this.mediadiariesService.findOnepostID(postid);
                        // } else if (postType == "story") {
                        //     data_media = await this.mediastoriesService.findOnepostID(postid);
                        // }

                        // var mediaId = data_media.mediaID;

                        // let CreateUserplaylistDto_ = new CreateUserplaylistDto();
                        // CreateUserplaylistDto_.mediaId = mediaId;
                        // CreateUserplaylistDto_.userPostId = iduserbuy;
                        // CreateUserplaylistDto_.postType = postType;
                        // console.log(langIso);

                        // await this.postsService.updateGenerateUserPlaylist(idusersell, CreateUserplaylistDto_);
                        await this.postContentService.generateCertificate(postid, langIso);

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
                } else if (type === "VOUCHER") {
                    var datavoucher = null;
                    var saleAmountVoucher = 0;
                    var voucherID = null;
                    var totalCredit = null;
                    var usedCredit = 0;
                    var totalUsed = 0;
                    var pendingUsed = 0;
                    var qtyvoucher = 0;
                    var postIds = "";
                    var qty = null;
                    var price = null;
                    var totalPrice = null;
                    var arraymount = [];
                    var expiredday = null;



                    var sum = 0;
                    for (var i = 0; i < lengtvoucherid; i++) {
                        postIds = detail[i].id.toString();
                        qty = detail[i].qty;
                        price = detail[i].price;
                        totalPrice = detail[i].totalAmount;

                        datavoucher = await this.vouchersService.findOne(postIds);
                        var amountobj = datavoucher.amount * qty;
                        arraymount.push(amountobj);

                    }

                    for (var i = 0; i < arraymount.length; i++) {
                        sum += arraymount[i];
                    }

                    saleAmountVoucher = sum;

                    var dt = new Date(Date.now());
                    dt.setHours(dt.getHours() + 7); // timestamp
                    dt = new Date(dt);
                    try {

                        datamradmin = await this.settingsService.findOne(idmdradmin);
                        var valuemradmin = datamradmin._doc.value;
                        nominalmradmin = Math.ceil(saleAmountVoucher * valuemradmin / 100);

                    } catch (e) {
                        nominalmradmin = 0;
                    }

                    amontVA = tamount - (saleAmountVoucher + nominalmradmin);
                    var amounvaadmin = null;
                    if (bankcode === "014") {
                        amounvaadmin = amontVA - valuevaBCA;
                    } else {
                        amounvaadmin = amontVA - valuevalainya;
                    }


                    if (status == "WAITING_PAYMENT") {
                        var ubasic = await this.userbasicsService.findid(iduserbuy);
                        var emailbuyer = ubasic.email;
                        var ubasicsell = await this.userbasicsService.findid(idusersell);
                        var emailseller = ubasicsell.email;

                        var createbalance = await this.accontbalanceVoucher(postid, idusersell, saleAmountVoucher);
                        var createbalanceadmin = await this.accontbalanceAdmin("Admin", idadmin, idusersell, nominalmradmin);
                        var createbalanceadminVa = await this.accontbalanceAdmin("Bank VA", idadmin, idusersell, amounvaadmin);
                        let databalance = await this.accountbalancesService.findOne(idusersell);

                        var idbalance = databalance._id;
                        await this.transactionsService.updateoneVoucher(idtransaction, idbalance, payload);
                        await this.utilsService.sendFcm(emailseller.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                        for (var i = 0; i < lengtvoucherid; i++) {
                            var postvcid = detail[i].id.toString();
                            var jml = detail[i].qty;
                            datavoucher = await this.vouchersService.findOne(postvcid);
                            expiredday = datavoucher.expiredDay;

                            var dex = new Date();
                            dex.setDate(dex.getDate() + expiredday);
                            dex = new Date(dex);
                            voucherID = datavoucher._id;
                            expiredAt = datavoucher.expiredAt;
                            totalUsed = datavoucher.totalUsed;
                            pendingUsed = datavoucher.pendingUsed;
                            qtyvoucher = datavoucher.qty;
                            totalCredit = datavoucher.creditTotal * jml;
                            var total_creditValue_voucher = datavoucher.creditValue * jml;
                            var total_creditPromo_voucher = datavoucher.creditPromo * jml;

                            let datauservoucher = new Uservoucher();
                            datauservoucher.userID = iduserbuy;
                            datauservoucher.createdAt = dt.toISOString();
                            datauservoucher.updatedAt = dt.toISOString();
                            datauservoucher.isActive = true;
                            datauservoucher.usedCredit = usedCredit;
                            datauservoucher.voucherID = voucherID;
                            datauservoucher.voucherCredit = totalCredit;
                            datauservoucher.totalCredit = totalCredit * jml;
                            datauservoucher.jmlVoucher = jml;
                            datauservoucher.expiredAt = dex.toISOString();
                            datauservoucher.credit = total_creditValue_voucher;
                            datauservoucher.creditFree = total_creditPromo_voucher;
                            await this.uservouchersService.create(datauservoucher);
                            // await this.vouchersService.updatestatuTotalUsed(voucherID, (totalUsed + jml), (pendingUsed - jml));
                            await this.vouchersService.updatestatuTotalUsed(voucherID, (totalUsed + jml));
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
                } else if (type === "BOOST_CONTENT") {
                    //GET USER BUY
                    var ubasic = await this.userbasicsService.findid(iduserbuy);
                    var emailbuyer = ubasic.email;
                    //GET TOTAL AMOUNT
                    var totalAmount = tamount;
                    //GET PRICE CONTENT BOOST
                    let priceContent = 0;
                    priceContent = await this.utilsService.getSetting_("636212286f07000023005ce2");
                    //GET VA PRICE
                    var vaAdmin = 0;
                    if (bankcode === "014") {
                        vaAdmin = valuevaBCA;
                    } else {
                        vaAdmin = valuevalainya;
                    }
                    //GET ADMIN PRICE
                    var priceAdmin = 0;
                    priceAdmin = totalAmount - priceContent - vaAdmin;

                    //GET CECK STATUS
                    if (status == "WAITING_PAYMENT") {
                        //EDIT CONTENT TO BOOST
                        this.editPostBost(postid, detail);
                        //CREATE ACCOUNT BALANCE CONTENT BOOST
                        var Accountbalances = await this.accontbalanceBoost(postid, idusersell, priceContent);
                        //CREATE ACCOUNT BALANCE VA ADMIN
                        await this.accontbalanceAdmin("Bank VA", idadmin, idusersell, vaAdmin);
                        //CREATE ACCOUNT BALANCE ADMIN
                        await this.accontbalanceAdmin("Admin", idadmin, idusersell, priceAdmin);

                        //GET ID ACCOUNT BALANCE CONTENT BOOST
                        var idbalance = Accountbalances._id;
                        //UPDATE TRANSACTION SUCCES PAYMENT
                        await this.transactionsService.updateoneBoost(idtransaction, idbalance, payload);

                        //SEND FCM SUCCES TRANSACTION
                        this.sendCommentFCM("BOOST_SUCCES", postid, emailbuyer.toString())
                        //this.sendCommentFCM("BOOST_CONTENT", postid, emailbuyer.toString())
                        this.sendemail(emailbuyer.toString(), "BOOST_SUCCES", datatransaksi);

                        //RESPONSE SUCCES
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
                }
            } catch (e) {
                throw new BadRequestException("Unabled to proceed" + e);
            }
        }
    }

    async sendCommentFCM(type: string, postID: string, receiverParty: string) {
        var Templates_ = new TemplatesRepo();
        Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

        var email = receiverParty;
        var titlein = Templates_.subject.toString();
        var titleen = Templates_.subject.toString();
        var bodyin = "";
        var bodyen = "";

        var email_post = "";
        var posts = await this.postsService.findid(postID);
        var bodyin_get = Templates_.body_detail_id.toString();
        var bodyen_get = Templates_.body_detail.toString();
        var post_type = "";
        if (await this.utilsService.ceckData(posts)) {
            post_type = posts.postType.toString();
            email_post = posts.email.toString();
        }
        var new_bodyin_get = bodyin_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));
        var new_bodyen_get = bodyen_get.replace("${post_type}", "Hypper" + post_type[0].toUpperCase() + post_type.substring(1));

        var bodyin = new_bodyin_get;
        var bodyen = new_bodyen_get;

        var eventType = type.toString();
        var event = "ACCEPT";
        await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
    }

    async editPostBost(postid: string, detail: any) {
        var boost = [];
        var dateStartdata = (detail[0].dateStart.toString() + "T" + detail[0].session.start.toString() + ".000Z")
        console.log("date String", dateStartdata);
        var dataBost = {
            type: detail[0].type.toString(),
            boostDate: new Date(detail[0].dateStart.toString()),
            boostInterval: {
                id: new mongoose.Types.ObjectId(detail[0].interval._id.toString()),
                value: detail[0].interval.value.toString(),
                remark: detail[0].interval.remark.toString(),
            },
            boostSession: {
                id: new mongoose.Types.ObjectId(detail[0].session._id.toString()),
                start: new Date((detail[0].dateStart.toString() + "T" + detail[0].session.start.toString() + ".000Z")),
                end: new Date((detail[0].datedateEnd.toString() + "T" + detail[0].session.end.toString() + ".000Z")),
                timeStart: detail[0].session.start,
                timeEnd: detail[0].session.end,
                name: detail[0].session.name,
            },
            boostViewer: [],
        }
        boost.push(dataBost);
        var CreatePostsDto_ = new CreatePostsDto();
        CreatePostsDto_.boostCount = 0;
        CreatePostsDto_.isBoost = 5;
        CreatePostsDto_.boosted = boost;
        await this.postsService.updateByPostId(postid, CreatePostsDto_)
    }

    async accontbalanceBoost(postid: string, idusersell: { oid: string }, amount: number): Promise<Accountbalances> {
        try {
            var currentDate = await this.utilsService.getDateTime();
            var desccontent = postid;
            var dataacountbalance = {
                iduser: idusersell,
                debet: 0,
                kredit: amount,
                type: "sell",
                timestamp: currentDate.toISOString(),
                description: "sell boost content: " + desccontent,
            };
            return await this.accountbalancesService.createdata(dataacountbalance);
        } catch (e) {
            console.log("--------------------------------START ERROR--------------------------------");
            console.log(e);
            console.log("--------------------------------END ERROR--------------------------------");
            return null;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/transactions/withdraw')
    async createwithdraw(@Res() res, @Headers('x-auth-token') auth: string, @Body() OyDisbursements: OyDisbursements, @Request() request) {
        if (OyDisbursements.pin != undefined) {
            if (OyDisbursements.email != undefined) {
                var ubasic = await this.userbasicsService.findOne(OyDisbursements.email);
                if (await this.utilsService.ceckData(ubasic)) {
                    if (ubasic.pin != undefined) {
                        var pin_descript = await this.utilsService.decrypt(ubasic.pin.toString());
                        if (pin_descript != OyDisbursements.pin) {
                            await this.errorHandler.generateNotAcceptableException(
                                "Unabled to proceed, Pin not Match",
                            );
                        }
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            "Unabled to proceed, Create a pin first",
                        );
                    }
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        "Unabled to proceed, User not found",
                    );
                }
            } else {
                await this.errorHandler.generateNotAcceptableException(
                    "Unabled to proceed, Param Email is required",
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                "Unabled to proceed, Param pin is required",
            );
        }

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
        // var ubasic = await this.userbasicsService.findOne(email);

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
        var totalamount = null;
        var idbankverificationcharge = "62bd4104f37a00001a004367";
        var idBankDisbursmentCharge = "62bd4126f37a00001a004368";
        var iduseradmin = "61d9c847548ae516042f0b13";
        var datainquiry = null;
        var data = null;
        // var valueinquiry = null;
        var idinquirycharge = "63217ae5ec46000002007405";
        var totalinquiry = null;
        // try {

        //     datainquiry = await this.settingsService.findOne(idinquirycharge);
        //     valueinquiry = datainquiry._doc.value;


        // } catch (e) {
        //     valueinquiry = 0;
        // }
        var idadmin = mongoose.Types.ObjectId(iduseradmin);
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
            // totalinquiry = valuebankcharge - valueinquiry;
            // totalinquiry = valuebankcharge;
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

        if (statusInquiry === false || statusInquiry === null || statusInquiry === undefined) {
            totalamount = amounreq - valuedisbcharge - valuebankcharge;
        } else {
            totalamount = amounreq - valuedisbcharge;
        }

        if (amounreq > totalsaldo) {
            throw new BadRequestException("The balance is not sufficient...!");
        }
        else {
            if (norekdb !== null && statusInquiry === true) {

                // let datareqinquiry = new OyAccountInquirys();
                // datareqinquiry.bank_code = recipient_bank;
                // datareqinquiry.account_number = recipient_account;
                // nama = namarek.toLowerCase();
                // let datareqinq = await this.oyPgService.inquiryAccount(datareqinquiry);
                // var statuscode = datareqinq.status.code;
                // var account_name = datareqinq.account_name;
                // var namaakun = account_name.toLowerCase();


                // if (statuscode === "000") {

                //     if (nama === namaakun) {
                var stringId = (await this.generateNumber()).toString();
                var partnertrxid = "OYO" + stringId;
                // await this.userbankaccountsService.updateone(idbankaccount, "success inquiry");
                // await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                //  await this.accontbalanceAdminWitdraw("inquiry", idadmin, iduser, totalinquiry);
                //await this.accontbalanceAdminWitdraw("inquiry", idadmin, iduser, valuebankcharge);
                OyDisbursements.partner_trx_id = partnertrxid;
                OyDisbursements.amount = totalamount;
                let datadisbursemen = await this.oyPgService.disbursement(OyDisbursements);



                var statusdisb = datadisbursemen.status.code;
                var timeoy = datadisbursemen.timestamp;
                var splittimeoy = timeoy.split(" ");

                var substrtahun = splittimeoy[0].substring(10, 6);

                var substrbulan = splittimeoy[0].substring(5, 3);

                var substrtanggal = splittimeoy[0].substring(0, 2);

                var strdate = substrtahun + "-" + substrbulan + "-" + substrtanggal + " " + splittimeoy[1];


                if (statusdisb === "101") {

                    var partnerTrxid = datadisbursemen.partner_trx_id;

                    let reqinfo = new OyDisbursementStatus2();
                    reqinfo.partner_trx_id = partnerTrxid;
                    let infodisbursemen = await this.oyPgService.disbursementStatus(reqinfo);
                    var statuscode = infodisbursemen.status.code;
                    var statusmessage = infodisbursemen.status.message;

                    if (statuscode === "000") {
                        let dtburs = new Date(strdate);
                        dtburs.setHours(dtburs.getHours() + 14); // timestamp
                        dtburs = new Date(dtburs);
                        let dtb = dtburs.toISOString();
                        await this.accontbalanceWithdraw(iduser, valuedisbcharge, "disbursement");
                        await this.accontbalanceAdminWitdraw("disbursement", idadmin, iduser, valuedisbcharge);
                        let datawithdraw = new CreateWithdraws();
                        datawithdraw.amount = amounreq;
                        datawithdraw.bankVerificationCharge = mongoose.Types.ObjectId(idbankverificationcharge);
                        datawithdraw.bankDisbursmentCharge = mongoose.Types.ObjectId(idBankDisbursmentCharge);
                        datawithdraw.description = OyDisbursements.note;
                        datawithdraw.idUser = iduser;
                        datawithdraw.status = statusmessage;
                        datawithdraw.timestamp = dtb;
                        datawithdraw.verified = false;
                        datawithdraw.partnerTrxid = partnertrxid;
                        datawithdraw.statusOtp = null;
                        datawithdraw.totalamount = totalamount;
                        datawithdraw.idAccountBank = idbankaccount;
                        var datatr = await this.withdrawsService.create(datawithdraw);
                        await this.accontbalanceWithdraw(iduser, totalamount, "withdraw");

                        try {
                            if (statusInquiry === false || statusInquiry === null || statusInquiry === undefined) {
                                data = {
                                    "idUser": datatr.idUser,
                                    "amount": datatr.amount,
                                    "status": datatr.status,
                                    "bankVerificationCharge": valuebankcharge,
                                    "bankDisbursmentCharge": valuedisbcharge,
                                    "timestamp": datatr.timestamp,
                                    "verified": datatr.verified,
                                    "description": datatr.description,
                                    "partnerTrxid": datatr.partnerTrxid,
                                    "statusOtp": datatr.statusOtp,
                                    "totalamount": totalamount,
                                    "_id": datatr._id
                                };
                            } else {
                                data = {
                                    "idUser": datatr.idUser,
                                    "amount": datatr.amount,
                                    "status": datatr.status,
                                    "bankVerificationCharge": 0,
                                    "bankDisbursmentCharge": valuedisbcharge,
                                    "timestamp": datatr.timestamp,
                                    "verified": datatr.verified,
                                    "description": datatr.description,
                                    "partnerTrxid": datatr.partnerTrxid,
                                    "statusOtp": datatr.statusOtp,
                                    "totalamount": totalamount,
                                    "_id": datatr._id
                                };
                            }


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
                    else if (statuscode === "101" || statuscode === "102") {
                        let dtburs = new Date(strdate);
                        dtburs.setHours(dtburs.getHours() + 14); // timestamp
                        dtburs = new Date(dtburs);
                        let dtb = dtburs.toISOString();
                        await this.accontbalanceWithdraw(iduser, valuedisbcharge, "disbursement");
                        await this.accontbalanceAdminWitdraw("disbursement", idadmin, iduser, valuedisbcharge);
                        let datawithdraw = new CreateWithdraws();
                        datawithdraw.amount = amounreq;
                        datawithdraw.bankVerificationCharge = mongoose.Types.ObjectId(idbankverificationcharge);
                        datawithdraw.bankDisbursmentCharge = mongoose.Types.ObjectId(idBankDisbursmentCharge);
                        datawithdraw.description = OyDisbursements.note;
                        datawithdraw.idUser = iduser;
                        datawithdraw.status = statusmessage;
                        datawithdraw.timestamp = dtb;
                        datawithdraw.verified = false;
                        datawithdraw.partnerTrxid = partnertrxid;
                        datawithdraw.statusOtp = null;
                        datawithdraw.totalamount = totalamount;
                        datawithdraw.idAccountBank = idbankaccount;
                        var datatr = await this.withdrawsService.create(datawithdraw);
                        await this.accontbalanceWithdraw(iduser, totalamount, "withdraw");

                        try {
                            if (statusInquiry === false || statusInquiry === null || statusInquiry === undefined) {
                                data = {
                                    "idUser": datatr.idUser,
                                    "amount": datatr.amount,
                                    "status": datatr.status,
                                    "bankVerificationCharge": valuebankcharge,
                                    "bankDisbursmentCharge": valuedisbcharge,
                                    "timestamp": datatr.timestamp,
                                    "verified": datatr.verified,
                                    "description": datatr.description,
                                    "partnerTrxid": datatr.partnerTrxid,
                                    "statusOtp": datatr.statusOtp,
                                    "totalamount": totalamount,
                                    "_id": datatr._id
                                };
                            } else {
                                data = {
                                    "idUser": datatr.idUser,
                                    "amount": datatr.amount,
                                    "status": datatr.status,
                                    "bankVerificationCharge": 0,
                                    "bankDisbursmentCharge": valuedisbcharge,
                                    "timestamp": datatr.timestamp,
                                    "verified": datatr.verified,
                                    "description": datatr.description,
                                    "partnerTrxid": datatr.partnerTrxid,
                                    "statusOtp": datatr.statusOtp,
                                    "totalamount": totalamount,
                                    "_id": datatr._id
                                };
                            }


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
                    else {
                        throw new BadRequestException(statusmessage);
                    }

                }
                else if (statusdisb == "208") {
                    throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                }
                else if (statusdisb == "204") {
                    throw new BadRequestException("Request is Rejected (Partner Tx ID is Not Found)");
                }

                else {
                    throw new BadRequestException("Disbursement is FAILED");
                }


                // } else {
                //     await this.userbankaccountsService.updateone(idbankaccount, "failed inquiry");
                //     await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                //     // await this.accontbalanceAdminWitdraw("inquiry", idadmin, iduser, valuebankcharge);
                //     res.status(HttpStatus.OK).json({
                //         response_code: 202,
                //         "message": "Nama Akun Bank tidak sama"
                //     });

                // }
                // }
                // else if (statusdisb == "208") {
                //     throw new BadRequestException("Request is Rejected (API Key is not Valid)");
                // }
                // else if (statusdisb == "201") {
                //     throw new BadRequestException("Request is Rejected (User ID is not Found)");
                // }
                // else if (statusdisb == "209") {
                //     throw new BadRequestException("Request is Rejected (Bank Account is not found)");
                // }
                // else {
                //     throw new BadRequestException("Request is Rejected");
                // }

            }
            else {
                throw new BadRequestException("Account Bank is not found...!");
            }
        }


    }

    @Post('api/pg/oy/callback/disbursement')
    async callbackDisbursement(@Res() res, @Body() payload: OyDisburseCallbacks) {

        const messages = {
            "info": ["Disbursement Request has been completed (success)"],
        };
        var datarek = null;
        var databank = null;
        var idbank = null;

        var recipient_name = payload.recipient_name;
        var recipient_bank = payload.recipient_bank;
        var recipient_account = payload.recipient_account;
        var partner_trx_id = payload.partner_trx_id;
        var statusCallback = payload.status.code;
        var statusMessage = payload.status.message;
        try {
            databank = await this.banksService.findbankcode(recipient_bank);
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }

        try {
            datarek = await this.userbankaccountsService.findnorekWithdraw(recipient_account, idbank, recipient_name);


        } catch (e) {
            datarek = null;
        }

        if (datarek !== null) {

            if (statusCallback === "000") {

                await this.withdrawsService.updateone(partner_trx_id, payload);

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messages
                });

            }

            else if (statusCallback === "210") {

                await this.withdrawsService.updatefailed(partner_trx_id, statusMessage, "Request is Rejected (Amount is not valid)", payload);

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": "Request is Rejected (Amount is not valid)"
                });

            }

            else if (statusCallback === "300") {

                await this.withdrawsService.updatefailed(partner_trx_id, statusMessage, "Disbursement is FAILED", payload);

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": "Disbursement is FAILED"
                });

            }
            else if (statusCallback === "301") {

                await this.withdrawsService.updatefailed(partner_trx_id, statusMessage, "Pending (When there is a unclear answer from Banks Network)", payload);

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": "Pending (When there is a unclear answer from Banks Network)"
                });

            } else {
                await this.withdrawsService.updatefailed(partner_trx_id, statusMessage, "Disbursement is FAILED", payload);

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": "Disbursement is FAILED"
                });
            }
        } else {
            throw new BadRequestException("recipient_account not found...!");
        }



    }

    @UseGuards(JwtAuthGuard)
    @Post('api/transactions/withdraw/listdetail')
    async detailwithdraw(@Res() res, @Req() request: Request) {

        const messages = {
            "info": ["Disbursement Request has been completed (success)"],
        };
        var datarek = null;
        var databank = null;
        var idbank = null;
        var bankcode = null;
        var bankname = null;
        var norek = null;
        var norekdb = null;
        var namarek = null;
        var iduser = null;
        var data = {};
        var nama = null;
        var amount = 0;
        var totalamount = 0;
        var valuebankcharge = 0;
        var valuedisbcharge = 0;
        var datasettingbankvercharge = null;
        var datasettingdisbvercharge = null;
        var idbankverificationcharge = "62bd4104f37a00001a004367";
        var idBankDisbursmentCharge = "62bd4126f37a00001a004368";
        var statusInquiry = null;
        var email = null;
        var datareqinq = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["norek"] !== undefined) {
            norek = request_json["norek"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["amount"] !== undefined) {
            amount = request_json["amount"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var ubasic = null;
        var idubasic = null;
        try {
            ubasic = await this.userbasicsService.findOne(email);
            idubasic = ubasic._id;
        } catch (e) {
            throw new BadRequestException("user not found");
        }


        try {
            datasettingbankvercharge = await this.settingsService.findOne(idbankverificationcharge);
            valuebankcharge = datasettingbankvercharge._doc.value;
            datasettingdisbvercharge = await this.settingsService.findOne(idBankDisbursmentCharge);
            valuedisbcharge = datasettingdisbvercharge._doc.value;

        } catch (e) {
            valuebankcharge = 0;
            valuedisbcharge = 0;

        }
        try {
            databank = await this.banksService.findbankcode(bankcode);
            idbank = databank._doc._id;
            bankname = databank._doc.bankname;
            datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
            var idbankaccount = datarek._doc._id;
            norekdb = datarek._doc.noRek;
            namarek = datarek._doc.nama;
            iduser = datarek._doc.userId;
            statusInquiry = datarek._doc.statusInquiry;

        } catch (e) {
            datarek = null;
            statusInquiry = null;
        }



        if (datarek !== null) {
            let datareqinquiry = new OyAccountInquirys();
            datareqinquiry.bank_code = bankcode;
            datareqinquiry.account_number = norek;
            if (statusInquiry === false || statusInquiry === null || statusInquiry === undefined) {
                datareqinq = await this.oyPgService.inquiryAccount(datareqinquiry);
                var statuscode = datareqinq.status.code;
                var account_name = datareqinq.account_name;
                var namaakun = account_name.toLowerCase();
                totalamount = amount - valuedisbcharge - valuebankcharge;
                if (statuscode == "000") {
                    await this.userbankaccountsService.updateone(idbankaccount, "success inquiry");
                    await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");

                    datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                    var idbankaccount = datarek._doc._id;
                    norekdb = datarek._doc.noRek;
                    namarek = datarek._doc.nama;
                    iduser = datarek._doc.userId;
                    statusInquiry = datarek._doc.statusInquiry;
                    nama = namarek.toLowerCase();
                    if (nama == namaakun) {
                        data = {
                            "name": account_name,
                            "bankName": bankname,
                            "bankAccount": norek,
                            "bankCode": bankcode,
                            "amount": amount,
                            "totalAmount": totalamount,
                            "adminFee": valuedisbcharge,
                            "chargeInquiry": valuebankcharge,
                            "statusInquiry": statusInquiry
                        }
                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "data": data,
                            "message": "Inquiry is success"
                        });
                    } else {
                        await this.userbankaccountsService.updateonefalse(idbankaccount, "failed inquiry");
                        await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                        datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                        var idbankaccount = datarek._doc._id;
                        norekdb = datarek._doc.noRek;
                        namarek = datarek._doc.nama;
                        iduser = datarek._doc.userId;
                        statusInquiry = datarek._doc.statusInquiry;

                        data = {
                            "name": account_name,
                            "bankName": bankname,
                            "bankAccount": norek,
                            "bankCode": bankcode,
                            "statusInquiry": statusInquiry
                        }
                        res.status(HttpStatus.OK).json({
                            response_code: 202,
                            "data": data,
                            "message": "Nama Akun bank tidak sama"
                        });
                    }

                }
                else if (statuscode == "201") {
                    await this.userbankaccountsService.updateonefalse(idbankaccount, "failed inquiry");
                    await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                    datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                    var idbankaccount = datarek._doc._id;
                    norekdb = datarek._doc.noRek;
                    namarek = datarek._doc.nama;
                    iduser = datarek._doc.userId;
                    statusInquiry = datarek._doc.statusInquiry;
                    data = {
                        "name": account_name,
                        "bankName": bankname,
                        "bankAccount": norek,
                        "bankCode": bankcode,
                        "statusInquiry": statusInquiry
                    }
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": "Request is Rejected (User ID is not Found)"
                    });

                }
                else if (statuscode == "208") {
                    await this.userbankaccountsService.updateonefalse(idbankaccount, "failed inquiry");
                    await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                    datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                    var idbankaccount = datarek._doc._id;
                    norekdb = datarek._doc.noRek;
                    namarek = datarek._doc.nama;
                    iduser = datarek._doc.userId;
                    statusInquiry = datarek._doc.statusInquiry;
                    data = {
                        "name": account_name,
                        "bankName": bankname,
                        "bankAccount": norek,
                        "bankCode": bankcode,
                        "statusInquiry": statusInquiry
                    }
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": "Request is Rejected (API Key is not Valid)"
                    });

                }
                else if (statuscode == "209") {
                    await this.userbankaccountsService.updateonefalse(idbankaccount, "failed inquiry");
                    await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                    datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                    var idbankaccount = datarek._doc._id;
                    norekdb = datarek._doc.noRek;
                    namarek = datarek._doc.nama;
                    iduser = datarek._doc.userId;
                    statusInquiry = datarek._doc.statusInquiry;
                    data = {
                        "name": account_name,
                        "bankName": bankname,
                        "bankAccount": norek,
                        "bankCode": bankcode,
                        "statusInquiry": statusInquiry
                    }
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": "Request is Rejected (Bank Account is not found)"
                    });
                } else {
                    await this.userbankaccountsService.updateonefalse(idbankaccount, "failed inquiry");
                    await this.accontbalanceWithdraw(iduser, valuebankcharge, "inquiry");
                    datarek = await this.userbankaccountsService.findnorekWithdrawuser(norek, idbank, idubasic);
                    var idbankaccount = datarek._doc._id;
                    norekdb = datarek._doc.noRek;
                    namarek = datarek._doc.nama;
                    iduser = datarek._doc.userId;
                    statusInquiry = datarek._doc.statusInquiry;
                    data = {
                        "name": account_name,
                        "bankName": bankname,
                        "bankAccount": norek,
                        "bankCode": bankcode,
                        "statusInquiry": statusInquiry
                    }
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": "Request is Rejected"
                    });
                }
            } else {
                totalamount = amount - valuedisbcharge;
                data = {
                    "name": namarek,
                    "bankName": bankname,
                    "bankAccount": norek,
                    "bankCode": bankcode,
                    "amount": amount,
                    "totalAmount": totalamount,
                    "adminFee": valuedisbcharge,
                    "chargeInquiry": 0,
                    "statusInquiry": statusInquiry
                }
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "data": data,
                    "message": "Inquiry is success"
                });
            }



        } else {

            throw new BadRequestException("recipient_account not found...!");
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

    async accontbalanceVoucher(postid: any[], idusersell: { oid: string }, amount: number) {
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var datapost = null;
        var desccontent = postid;
        // try {
        //     datapost = await this.vouchersService.findOne(postid);

        //     desccontent = datapost._doc.nameAds;


        // } catch (e) {
        //     datapost = null;
        //     desccontent = "";
        // }
        var dataacountbalance = {
            iduser: idusersell,
            debet: 0,
            kredit: amount,
            type: "sell",
            timestamp: dt.toISOString(),
            description: "sell voucher " + desccontent,

        };

        await this.accountbalancesService.createdata(dataacountbalance);
    }

    async accontbalanceAdmin(type: string, iduseradmin: { oid: string }, idusersell: { oid: string }, amount: number) {
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);


        var dataacountbalance = {
            iduser: iduseradmin,
            debet: 0,
            kredit: amount,
            type: type,
            timestamp: dt.toISOString(),
            description: type + " Charge dari user " + idusersell,

        };

        await this.accountbalancesService.createdata(dataacountbalance);
    }

    async accontbalanceAdminWitdraw(type: string, iduseradmin: { oid: string }, idusersell: { oid: String }, amount: number) {
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var dataacountbalance = {
            iduser: iduseradmin,
            debet: 0,
            kredit: amount,
            type: type,
            timestamp: dt.toISOString(),
            description: type + " Charge dari user " + idusersell,

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
        } else if (tipe === "disbursement") {
            desccontent = "disbursement";
        } else {
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

    @Post('api/transactions/historys')
    @UseGuards(JwtAuthGuard)
    async searchhistorytransaksi(@Req() request: Request): Promise<any> {
        var startdate = null;
        var enddate = null;
        var iduser = null;
        var email = null;
        var datasell = null;
        var datasellcount = null;
        var databoost = null;
        var databoostcount = null;
        var skip = null;
        var limit = null;
        var databuy = null;
        var databuycount = null;
        var datawithdraw = null;
        var datawithdrawcount = null;
        var sell = null;
        var buy = null;
        var withdrawal = null;
        var data = null;
        var datacount = null;
        var dtcount = null;
        var status = null;
        var boost = null;
        var titleinsukses = "Pembayaran Diajukan!";
        var titleensukses = "Payment Filed!";
        var bodyinsukses = "Periode pembayaran telah berlalu waktu kadaluarsa. konten Anda terdaftar tidak akan diposting";
        var bodyensukses = "The payment period has passed the expiration time. The content you registered will not posted";
        var eventType = "TRANSACTION";
        var event = "TRANSACTION";
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;

        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        if (request_json["sell"] !== undefined) {
            sell = request_json["sell"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["buy"] !== undefined) {
            buy = request_json["buy"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["withdrawal"] !== undefined) {
            withdrawal = request_json["withdrawal"];
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

        boost = request_json["boost"];
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idadmin = mongoose.Types.ObjectId(iduser);
        var datatrpending = null;
        var datatrpendingjual = null;

        try {

            datatrpending = await this.transactionsService.findExpired(iduser);


        } catch (e) {
            datatrpending = null;

        }

        if (datatrpending !== null) {
            var datenow = new Date(Date.now());


            var lengdatatr = datatrpending.length;

            for (var i = 0; i < lengdatatr; i++) {

                var idva = datatrpending[i].idva;
                var idtransaction = datatrpending[i]._id;
                var expiredva = new Date(datatrpending[i].expiredtimeva);
                expiredva.setHours(expiredva.getHours() - 7);

                if (datenow > expiredva) {
                    let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                    if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {
                        await this.transactionsService.updatestatuscancel(idtransaction);
                        //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                    }


                }


            }

        }

        try {

            datatrpendingjual = await this.transactionsService.findExpiredSell(iduser);


        } catch (e) {
            datatrpendingjual = null;

        }

        if (datatrpendingjual !== null) {
            var datenow = new Date(Date.now());


            var lengdatatr = datatrpendingjual.length;

            for (var i = 0; i < lengdatatr; i++) {

                var idva = datatrpendingjual[i].idva;
                var idtransaction = datatrpendingjual[i]._id;
                var expiredva = new Date(datatrpendingjual[i].expiredtimeva);
                expiredva.setHours(expiredva.getHours() - 7);

                if (datenow > expiredva) {
                    let cekstatusva = await this.oyPgService.staticVaInfo(idva);

                    if (cekstatusva.va_status === "STATIC_TRX_EXPIRED" || cekstatusva.va_status === "EXPIRED") {
                        await this.transactionsService.updatestatuscancel(idtransaction);
                        //await this.utilsService.sendFcm(email.toString(), titleinsukses, titleensukses, bodyinsukses, bodyensukses, eventType, event);
                    }


                }


            }

        }

        if (sell === true && buy === false && withdrawal === false && startdate === undefined && enddate === undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = datasell;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = datasellcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === false && withdrawal === false && startdate === undefined && enddate === undefined && boost === true) {
            databoost = await this.transactionsService.findhistoryBuyBoost(idadmin, status, startdate, enddate, skip, limit);
            databoostcount = await this.transactionsService.findhistoryBuyBoost(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = databoost;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = databoostcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === false && withdrawal === false && startdate !== undefined && enddate !== undefined && boost === true) {
            databoost = await this.transactionsService.findhistoryBuyBoost(idadmin, status, startdate, enddate, skip, limit);
            databoostcount = await this.transactionsService.findhistoryBuyBoost(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = databoost;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = databoostcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === false && withdrawal === false && startdate !== undefined && enddate !== undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = datasell;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = datasellcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === true && withdrawal === false && startdate === undefined && enddate === undefined && boost === false) {
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = databuy;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = databuycount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === true && withdrawal === false && startdate !== undefined && enddate !== undefined && boost === false) {

            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = databuy;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = databuycount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === false && withdrawal === true && startdate === undefined && enddate === undefined && boost === false) {
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datawithdraw;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = datawithdrawcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };

        }
        else if (sell === false && buy === false && withdrawal === true && startdate !== undefined && enddate !== undefined && boost === false) {
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datawithdraw;
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            datacount = datawithdrawcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }

        else if (sell === true && buy === true && withdrawal === false && startdate === undefined && enddate === undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = datasell.concat(databuy);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === true && withdrawal === false && startdate !== undefined && enddate !== undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            data = datasell.concat(databuy);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === false && withdrawal === true && startdate === undefined && enddate === undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === false && withdrawal === true && startdate !== undefined && enddate !== undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === true && withdrawal === true && startdate === undefined && enddate === undefined && boost === false) {
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = databuy.concat(datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = databuycount.concat(datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === true && withdrawal === true && startdate !== undefined && enddate !== undefined && boost === false) {
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = databuy.concat(datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = databuycount.concat(datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === false && withdrawal === false && startdate !== undefined && enddate !== undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(databuy, datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount, datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === true && withdrawal === true && startdate === undefined && enddate === undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(databuy, datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount, datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === true && buy === true && withdrawal === true && startdate !== undefined && enddate !== undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuy(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuy(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(databuy, datawithdraw);
            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount, datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }
        else if (sell === false && buy === false && withdrawal === false && startdate === undefined && enddate === undefined && boost === false) {
            datasell = await this.transactionsService.findhistorySell(idadmin, status, startdate, enddate, skip, limit);
            datasellcount = await this.transactionsService.findhistorySell(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            databuy = await this.transactionsService.findhistoryBuyAll(idadmin, status, startdate, enddate, skip, limit);
            databuycount = await this.transactionsService.findhistoryBuyAll(idadmin, "WAITING_PAYMENT", startdate, enddate, undefined, undefined);
            datawithdraw = await this.withdrawsService.findhistoryWithdraw(idadmin, status, startdate, enddate, skip, limit);
            datawithdrawcount = await this.withdrawsService.findhistoryWithdrawCount(idadmin, "WAITING_PAYMENT", startdate, enddate, skip, limit);
            data = datasell.concat(databuy, datawithdraw);

            data.sort((first, second) => {
                if (first.timestamp > second.timestamp) return -1;
                if (first.timestamp < second.timestamp) return 1;
                return 0;
            });
            dtcount = datasellcount.concat(databuycount, datawithdrawcount);
            datacount = dtcount.length;
            return { response_code: 202, data, skip, limit, datacount, messages };
        }



        // console.log(datawithdraw)
        // var data = datasell.concat(databuy, datawithdraw);


    }

    @Post('api/transactions/list')
    @UseGuards(JwtAuthGuard)
    async searchhistory(@Req() request: Request): Promise<any> {
        var startdate = null;
        var enddate = null;
        var iduser = null;
        var email = null;
        var datasell = null;
        var datasellcount = null;
        var skip = null;
        var limit = null;
        var databuy = null;
        var databuycount = null;
        var datawithdraw = null;
        var datawithdrawcount = null;
        var sell = null;
        var buy = null;
        var withdrawal = null;
        var data = [];
        var datacount = null;
        var dtcount = [];
        var status = null;
        var rewards = null;
        var datarewards = null;
        var datarewardscount = null;
        var titleinsukses = "Pembayaran Diajukan!";
        var titleensukses = "Payment Filed!";
        var bodyinsukses = "Periode pembayaran telah berlalu waktu kadaluarsa. konten Anda terdaftar tidak akan diposting";
        var bodyensukses = "The payment period has passed the expiration time. The content you registered will not posted";
        var eventType = "TRANSACTION";
        var event = "TRANSACTION";
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;

        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];

        if (request_json["sell"] !== undefined) {
            sell = request_json["sell"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["buy"] !== undefined) {
            buy = request_json["buy"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["withdrawal"] !== undefined) {
            withdrawal = request_json["withdrawal"];
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

        if (request_json["rewards"] !== undefined) {
            rewards = request_json["rewards"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The process successful"],
        };
        var totalsaldo = null;

        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idadmin = mongoose.Types.ObjectId(iduser);

        try {
            totalsaldo = await this.accountbalancesService.findsaldo(idadmin);
        } catch (e) {
            totalsaldo = 0;
        }
        if (sell) {
            datasell = await this.transactionsService.findhistorySeller(idadmin, status, startdate, enddate, 0, 0);
            data = data.concat(datasell);
        }
        if (buy) {
            databuy = await this.transactionsService.findhistoryBuyer(idadmin, status, startdate, enddate, 0, 0);
            data = data.concat(databuy);
        }
        if (withdrawal) {
            datawithdraw = await this.withdrawsService.findhistoryWithdrawer(idadmin, status, startdate, enddate, 0, 0);
            data = data.concat(datawithdraw);
        }
        if (rewards) {
            datarewards = await this.accountbalancesService.findreward(idadmin, startdate, enddate, 0, 0);
            data = data.concat(datarewards);
        }
        datacount = data.length;
        data.sort((first, second) => {
            if (first.timestamp > second.timestamp) return -1;
            if (first.timestamp < second.timestamp) return 1;
            return 0;
        });
        const fData = [];
        var j = 0;
        for (var i = data.length - (skip + 1); i >= 0; i--, j++) {
            if (limit > 0 && j == limit)
                break;
            fData.push(data[i]);
        }
        return { response_code: 202, totalsaldo, fData, skip, limit, datacount, messages };
    }

    @Post('api/transactions/historys/details')
    @UseGuards(JwtAuthGuard)
    async trdetailbuysell(@Req() request: Request): Promise<any> {
        var data = null;
        var id = null;
        var type = null;
        var email = null;
        var iduser = null;
        var jenis = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["type"] !== undefined) {
            type = request_json["type"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        jenis = request_json["jenis"];


        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            iduser = ubasic._id;

        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var idmdradmin = "62bd413ff37a00001a004369";
        var idbankvacharge = "62bd40e0f37a00001a004366";

        var databankvacharge = null;
        var datamradmin = null;
        var amount = 0;

        const messages = {
            "info": ["The process successful"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idtr = mongoose.Types.ObjectId(id);
        var databuy = null;
        var amount = 0;
        var valuevacharge = 0;
        var valuemradmin = 0;
        var nominalmradmin = 0;
        var noinvoice = "";
        var mediaThumbEndpoint = "";
        var mediaThumbUri = "";
        var idbank = null;
        var datamethode = null;
        var namamethode = "";
        var paymentmethod = null;
        var databank = null;
        var namabank = "";
        var amounts = 0;
        var dataconten = null;
        var saleAmount = 0;
        var dataWitdraw = null;
        var dataakunbank = null;
        var datavoucher = null;
        try {

            if (type === "Buy" && jenis === "CONTENT") {
                databuy = await this.transactionsService.findhistorydetailbuy(idtr, type, jenis, iduser);
                var postid = databuy[0].postID;


                paymentmethod = databuy[0].paymentmethod;

                idbank = databuy[0].bank.toString();
                amounts = databuy[0].amount;

                noinvoice = databuy[0].noinvoice;
                mediaThumbEndpoint = databuy[0].mediaThumbEndpoint;
                mediaThumbUri = databuy[0].mediaThumbUri;
                try {
                    dataconten = await this.getusercontentsService.findcontenbuy(postid);
                    saleAmount = dataconten[0].saleAmount;
                } catch (e) {
                    dataconten = null;
                    saleAmount = 0;
                }

                try {
                    datamethode = await this.methodepaymentsService.findOne(paymentmethod);
                    namamethode = datamethode._doc.methodename;


                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                try {

                    datamradmin = await this.settingsService.findOne(idmdradmin);
                    databankvacharge = await this.settingsService.findOne(idbankvacharge);
                    valuevacharge = databankvacharge._doc.value;
                    valuemradmin = datamradmin._doc.value;
                    nominalmradmin = Math.ceil(amounts * valuemradmin / 100);




                } catch (e) {
                    datamradmin = null;
                    databankvacharge = null;
                    valuevacharge = 0;
                    valuemradmin = 0;
                    nominalmradmin = 0;
                }

                try {
                    databank = await this.banksService.findOne(idbank);
                    namabank = databank._doc.bankname;

                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }

                amount = saleAmount;
                var selluser = databuy[0].idusersell;



                try {
                    var ubasic = await this.userbasicsService.findid(selluser);
                    var namapenjual = ubasic.fullName;
                    var emailpenjual = ubasic.email;
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                var dataapsara = null;
                var arrdata = [];
                let pict: String[] = [];
                var objk = {};
                var idapsara = null;
                var apsara = null;
                var idapsaradefine = null;
                var apsaradefine = null;
                try {
                    idapsara = databuy[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }

                try {
                    apsara = databuy[0].apsara;
                } catch (e) {
                    apsara = false;
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
                var type = databuy[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = [];
                } else {
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

                data = {

                    "_id": idtr,
                    "type": databuy[0].type,
                    "jenis": databuy[0].jenis,
                    "time": databuy[0].timestamp,
                    "description": databuy[0].description,
                    "noinvoice": noinvoice,
                    "nova": databuy[0].nova,
                    "expiredtimeva": databuy[0].expiredtimeva,
                    "like": databuy[0].salelike,
                    "view": databuy[0].saleview,
                    "bank": namabank,
                    "paymentmethode": namamethode,
                    "amount": amounts,
                    "totalamount": databuy[0].totalamount,
                    "adminFee": nominalmradmin,
                    "serviceFee": valuevacharge,
                    "status": databuy[0].status,
                    "fullName": databuy[0].fullName,
                    "email": databuy[0].email,
                    "namapenjual": namapenjual,
                    "emailpenjual": emailpenjual,
                    "postID": databuy[0].postID,
                    "postType": databuy[0].postType,
                    "totallike": databuy[0].likes,
                    "totalview": databuy[0].views,
                    "descriptionContent": databuy[0].descriptionContent,
                    "title": databuy[0].title,
                    "mediaBasePath": databuy[0].mediaBasePath,
                    "mediaUri": databuy[0].mediaUri,
                    "mediaType": databuy[0].mediaType,
                    "mediaEndpoint": databuy[0].mediaEndpoint,
                    "mediaThumbEndpoint": mediaThumbEndpoint,
                    "mediaThumbUri": mediaThumbUri,
                    "apsara": apsaradefine,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara

                };
            }
            else if (type === "Sell" && jenis === "CONTENT") {
                databuy = await this.transactionsService.findhistorydetailsell(idtr, type, jenis, iduser);
                var postid = databuy[0].postID;


                paymentmethod = databuy[0].paymentmethod;

                idbank = databuy[0].bank.toString();
                amounts = databuy[0].amount;

                noinvoice = databuy[0].noinvoice;
                mediaThumbEndpoint = databuy[0].mediaThumbEndpoint;
                mediaThumbUri = databuy[0].mediaThumbUri;
                try {
                    dataconten = await this.getusercontentsService.findcontenbuy(postid);
                    saleAmount = dataconten[0].saleAmount;
                } catch (e) {
                    dataconten = null;
                    saleAmount = 0;
                }

                try {
                    datamethode = await this.methodepaymentsService.findOne(paymentmethod);
                    namamethode = datamethode._doc.methodename;


                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                try {

                    datamradmin = await this.settingsService.findOne(idmdradmin);
                    databankvacharge = await this.settingsService.findOne(idbankvacharge);
                    valuevacharge = databankvacharge._doc.value;
                    valuemradmin = datamradmin._doc.value;
                    nominalmradmin = Math.ceil(saleAmount * valuemradmin / 100);




                } catch (e) {
                    datamradmin = null;
                    databankvacharge = null;
                    valuevacharge = 0;
                    valuemradmin = 0;
                    nominalmradmin = 0;
                }

                try {
                    databank = await this.banksService.findOne(idbank);
                    namabank = databank._doc.bankname;

                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }

                amount = saleAmount;
                var buyuser = databuy[0].iduserbuyer;

                try {
                    var ubasic = await this.userbasicsService.findid(buyuser);
                    var namapembeli = ubasic.fullName;
                    var emailpembeli = ubasic.email;
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                var dataapsara = null;
                var arrdata = [];
                let pict: String[] = [];
                var objk = {};
                var idapsara = null;
                var apsara = null;
                var idapsaradefine = null;
                var apsaradefine = null;
                try {
                    idapsara = databuy[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }

                try {
                    apsara = databuy[0].apsara;
                } catch (e) {
                    apsara = false;
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
                var type = databuy[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = [];
                } else {
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
                data = {

                    "_id": idtr,
                    "type": databuy[0].type,
                    "jenis": databuy[0].jenis,
                    "time": databuy[0].timestamp,
                    "noinvoice": noinvoice,
                    "description": databuy[0].description,
                    "like": databuy[0].salelike,
                    "view": databuy[0].saleview,
                    "bank": namabank,
                    "paymentmethode": namamethode,
                    "amount": amount,
                    "totalamount": databuy[0].totalamount,
                    "status": databuy[0].status,
                    "fullName": databuy[0].fullName,
                    "email": databuy[0].email,
                    "namapembeli": namapembeli,
                    "emailpembeli": emailpembeli,
                    "postID": databuy[0].postID,
                    "postType": databuy[0].postType,
                    "totallike": databuy[0].likes,
                    "totalview": databuy[0].views,
                    "descriptionContent": databuy[0].descriptionContent,
                    "title": databuy[0].title,
                    "mediaBasePath": databuy[0].mediaBasePath,
                    "mediaUri": databuy[0].mediaUri,
                    "mediaType": databuy[0].mediaType,
                    "mediaEndpoint": databuy[0].mediaEndpoint,
                    "mediaThumbEndpoint": mediaThumbEndpoint,
                    "mediaThumbUri": mediaThumbUri,
                    "apsara": apsaradefine,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara

                };
            }
            else if (type === "Buy" && jenis === "BOOST_CONTENT") {
                databuy = await this.transactionsService.findhistorydetailbuy(idtr, type, jenis, iduser);
                var postid = databuy[0].postID;


                paymentmethod = databuy[0].paymentmethod;

                idbank = databuy[0].bank.toString();
                amounts = databuy[0].amount;

                noinvoice = databuy[0].noinvoice;
                mediaThumbEndpoint = databuy[0].mediaThumbEndpoint;
                mediaThumbUri = databuy[0].mediaThumbUri;
                try {
                    dataconten = await this.getusercontentsService.findcontenbuy(postid);
                    saleAmount = dataconten[0].saleAmount;
                } catch (e) {
                    dataconten = null;
                    saleAmount = 0;
                }

                try {
                    datamethode = await this.methodepaymentsService.findOne(paymentmethod);
                    namamethode = datamethode._doc.methodename;


                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                try {

                    datamradmin = await this.settingsService.findOne(idmdradmin);
                    databankvacharge = await this.settingsService.findOne(idbankvacharge);
                    valuevacharge = databankvacharge._doc.value;
                    valuemradmin = datamradmin._doc.value;
                    nominalmradmin = Math.ceil(amounts * valuemradmin / 100);




                } catch (e) {
                    datamradmin = null;
                    databankvacharge = null;
                    valuevacharge = 0;
                    valuemradmin = 0;
                    nominalmradmin = 0;
                }

                try {
                    databank = await this.banksService.findOne(idbank);
                    namabank = databank._doc.bankname;

                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }

                amount = saleAmount;
                var selluser = databuy[0].idusersell;



                try {
                    var ubasic = await this.userbasicsService.findid(selluser);
                    var namapenjual = ubasic.fullName;
                    var emailpenjual = ubasic.email;
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                var dataapsara = null;
                var arrdata = [];
                let pict: String[] = [];
                var objk = {};
                var idapsara = null;
                var apsara = null;
                var idapsaradefine = null;
                var apsaradefine = null;
                try {
                    idapsara = databuy[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }

                try {
                    apsara = databuy[0].apsara;
                } catch (e) {
                    apsara = false;
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
                var type = databuy[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = [];
                } else {
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

                data = {

                    "_id": idtr,
                    "type": databuy[0].type,
                    "jenis": databuy[0].jenis,
                    "time": databuy[0].timestamp,
                    "description": databuy[0].description,
                    "noinvoice": noinvoice,
                    "nova": databuy[0].nova,
                    "expiredtimeva": databuy[0].expiredtimeva,
                    "like": databuy[0].salelike,
                    "view": databuy[0].saleview,
                    "bank": namabank,
                    "paymentmethode": namamethode,
                    "amount": amounts,
                    "totalamount": databuy[0].totalamount,
                    "adminFee": nominalmradmin,
                    "serviceFee": valuevacharge,
                    "status": databuy[0].status,
                    "fullName": databuy[0].fullName,
                    "email": databuy[0].email,
                    "namapenjual": namapenjual,
                    "emailpenjual": emailpenjual,
                    "postID": databuy[0].postID,
                    "postType": databuy[0].postType,
                    "totallike": databuy[0].likes,
                    "totalview": databuy[0].views,
                    "descriptionContent": databuy[0].descriptionContent,
                    "title": databuy[0].title,
                    "mediaBasePath": databuy[0].mediaBasePath,
                    "mediaUri": databuy[0].mediaUri,
                    "mediaType": databuy[0].mediaType,
                    "mediaEndpoint": databuy[0].mediaEndpoint,
                    "mediaThumbEndpoint": mediaThumbEndpoint,
                    "mediaThumbUri": mediaThumbUri,
                    "apsara": apsaradefine,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara

                };
            }
            else if (type === "Sell" && jenis === "BOOST_CONTENT") {
                databuy = await this.transactionsService.findhistorydetailsell(idtr, type, jenis, iduser);
                var postid = databuy[0].postID;


                paymentmethod = databuy[0].paymentmethod;

                idbank = databuy[0].bank.toString();
                amounts = databuy[0].amount;

                noinvoice = databuy[0].noinvoice;
                mediaThumbEndpoint = databuy[0].mediaThumbEndpoint;
                mediaThumbUri = databuy[0].mediaThumbUri;
                try {
                    dataconten = await this.getusercontentsService.findcontenbuy(postid);
                    saleAmount = dataconten[0].saleAmount;
                } catch (e) {
                    dataconten = null;
                    saleAmount = 0;
                }

                try {
                    datamethode = await this.methodepaymentsService.findOne(paymentmethod);
                    namamethode = datamethode._doc.methodename;


                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                try {

                    datamradmin = await this.settingsService.findOne(idmdradmin);
                    databankvacharge = await this.settingsService.findOne(idbankvacharge);
                    valuevacharge = databankvacharge._doc.value;
                    valuemradmin = datamradmin._doc.value;
                    nominalmradmin = Math.ceil(saleAmount * valuemradmin / 100);




                } catch (e) {
                    datamradmin = null;
                    databankvacharge = null;
                    valuevacharge = 0;
                    valuemradmin = 0;
                    nominalmradmin = 0;
                }

                try {
                    databank = await this.banksService.findOne(idbank);
                    namabank = databank._doc.bankname;

                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }

                amount = saleAmount;
                var buyuser = databuy[0].iduserbuyer;

                try {
                    var ubasic = await this.userbasicsService.findid(buyuser);
                    var namapembeli = ubasic.fullName;
                    var emailpembeli = ubasic.email;
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                var dataapsara = null;
                var arrdata = [];
                let pict: String[] = [];
                var objk = {};
                var idapsara = null;
                var apsara = null;
                var idapsaradefine = null;
                var apsaradefine = null;
                try {
                    idapsara = databuy[0].apsaraId;
                } catch (e) {
                    idapsara = "";
                }

                try {
                    apsara = databuy[0].apsara;
                } catch (e) {
                    apsara = false;
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
                var type = databuy[0].postType;
                pict = [idapsara];

                if (idapsara === "") {
                    dataapsara = [];
                } else {
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
                data = {

                    "_id": idtr,
                    "type": databuy[0].type,
                    "jenis": databuy[0].jenis,
                    "time": databuy[0].timestamp,
                    "noinvoice": noinvoice,
                    "description": databuy[0].description,
                    "like": databuy[0].salelike,
                    "view": databuy[0].saleview,
                    "bank": namabank,
                    "paymentmethode": namamethode,
                    "amount": amount,
                    "totalamount": databuy[0].totalamount,
                    "status": databuy[0].status,
                    "fullName": databuy[0].fullName,
                    "email": databuy[0].email,
                    "namapembeli": namapembeli,
                    "emailpembeli": emailpembeli,
                    "postID": databuy[0].postID,
                    "postType": databuy[0].postType,
                    "totallike": databuy[0].likes,
                    "totalview": databuy[0].views,
                    "descriptionContent": databuy[0].descriptionContent,
                    "title": databuy[0].title,
                    "mediaBasePath": databuy[0].mediaBasePath,
                    "mediaUri": databuy[0].mediaUri,
                    "mediaType": databuy[0].mediaType,
                    "mediaEndpoint": databuy[0].mediaEndpoint,
                    "mediaThumbEndpoint": mediaThumbEndpoint,
                    "mediaThumbUri": mediaThumbUri,
                    "apsara": apsaradefine,
                    "apsaraId": idapsaradefine,
                    "media": dataapsara

                };
            }
            else if (type === "Buy" && jenis === "VOUCHER") {
                databuy = await this.transactionsService.findtransactionvoucher(idtr, type, jenis, iduser);
                var selluser = databuy[0].idusersell;
                var userdata = databuy[0].user_data;
                var detail = databuy[0].detail;
                paymentmethod = databuy[0].paymentmethod;

                idbank = databuy[0].bank.toString();
                amounts = databuy[0].amount;

                noinvoice = databuy[0].noinvoice;
                try {
                    datamethode = await this.methodepaymentsService.findOne(paymentmethod);
                    namamethode = datamethode._doc.methodename;


                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                try {

                    datamradmin = await this.settingsService.findOne(idmdradmin);
                    databankvacharge = await this.settingsService.findOne(idbankvacharge);
                    valuevacharge = databankvacharge._doc.value;
                    valuemradmin = datamradmin._doc.value;
                    nominalmradmin = amounts * valuemradmin / 100;




                } catch (e) {
                    datamradmin = null;
                    databankvacharge = null;
                    valuevacharge = 0;
                    valuemradmin = 0;
                    nominalmradmin = 0;
                }

                try {
                    databank = await this.banksService.findOne(idbank);
                    namabank = databank._doc.bankname;

                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }

                try {
                    var ubasic = await this.userbasicsService.findid(selluser);
                    var namapenjual = ubasic.fullName;
                    var emailpenjual = ubasic.email;
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
                var arraydetail = [];

                var lengdetail = detail.length;

                for (var i = 0; i < lengdetail; i++) {
                    var idv = detail[i].id.toString();
                    var qty = detail[i].qty;

                    datavoucher = await this.vouchersService.findOne(idv);
                    console.log(datavoucher);

                    var objdetail = {
                        "voucherID": idv,
                        "noVoucher": datavoucher._doc.noVoucher,
                        "codeVoucher": datavoucher._doc.codeVoucher,
                        "isActive": datavoucher._doc.isActive,
                        "expiredAt": datavoucher._doc.expiredAt,
                        "qty": qty,
                        "price": detail[i].price,
                        "totalPrice": detail[i].totalAmount,
                        "totalCredit": datavoucher._doc.creditTotal * qty

                    };

                    arraydetail.push(objdetail);

                }


                data = {

                    "_id": idtr,
                    "type": databuy[0].type,
                    "jenis": databuy[0].jenis,
                    "time": databuy[0].timestamp,
                    "description": databuy[0].description,
                    "noinvoice": noinvoice,
                    "nova": databuy[0].nova,
                    "expiredtimeva": databuy[0].expiredtimeva,
                    "bank": namabank,
                    "paymentmethode": namamethode,
                    "amount": amounts,
                    "totalamount": databuy[0].totalamount,
                    "adminFee": nominalmradmin,
                    "serviceFee": valuevacharge,
                    "status": databuy[0].status,
                    "fullName": userdata[0].fullName,
                    "email": userdata[0].email,
                    "namapenjual": namapenjual,
                    "emailpenjual": emailpenjual,
                    "detailTransaction": arraydetail

                };

            }
            else if (type === "Withdrawal") {

                try {
                    dataWitdraw = await this.withdrawsService.findhistoryWithdrawdetail(idtr, iduser);
                    var idacountbank = dataWitdraw[0].idAccountBank;
                    dataakunbank = await this.userbankaccountsService.findOneid(idacountbank);
                    var idBnk = dataakunbank._doc.idBank;
                    var statusInquiry = dataakunbank._doc.statusInquiry;
                    var databank = null;
                    var namabank = "";
                    try {
                        databank = await this.banksService.findOne(idBnk);
                        namabank = databank._doc.bankname;


                    } catch (e) {
                        throw new BadRequestException("Data not found...!");
                    }


                    var idbankverificationcharge = "62bd4104f37a00001a004367";
                    var idBankDisbursmentCharge = "62bd4126f37a00001a004368";
                    var iduseradmin = "61d9c847548ae516042f0b13";
                    var datasettingbankvercharge = null;
                    var datasettingdisbvercharge = null;
                    var valuebankcharge = 0;
                    var valuedisbcharge = 0;

                    try {
                        datasettingbankvercharge = await this.settingsService.findOne(idbankverificationcharge);
                        valuebankcharge = datasettingbankvercharge._doc.value;
                        datasettingdisbvercharge = await this.settingsService.findOne(idBankDisbursmentCharge);
                        valuedisbcharge = datasettingdisbvercharge._doc.value;

                    } catch (e) {
                        valuebankcharge = 0;
                        valuedisbcharge = 0;
                    }

                    if (statusInquiry === false || statusInquiry === null || statusInquiry === undefined) {
                        data = {

                            "_id": idtr,
                            "iduser": dataWitdraw[0].iduser,
                            "fullName": dataWitdraw[0].fullName,
                            "email": dataWitdraw[0].email,
                            "type": dataWitdraw[0].type,
                            "timestamp": dataWitdraw[0].timestamp,
                            "amount": dataWitdraw[0].amount,
                            "totalamount": dataWitdraw[0].totalamount,
                            "adminFee": valuedisbcharge,
                            "bankverificationcharge": valuebankcharge,
                            "description": dataWitdraw[0].description,
                            "status": dataWitdraw[0].status,
                            "noRek": dataakunbank._doc.noRek,
                            "namaRek": dataakunbank._doc.nama,
                            "namaBank": namabank
                        };
                    } else {
                        data = {

                            "_id": idtr,
                            "iduser": dataWitdraw[0].iduser,
                            "fullName": dataWitdraw[0].fullName,
                            "email": dataWitdraw[0].email,
                            "type": dataWitdraw[0].type,
                            "timestamp": dataWitdraw[0].timestamp,
                            "amount": dataWitdraw[0].amount,
                            "totalamount": dataWitdraw[0].totalamount,
                            "adminFee": valuedisbcharge,
                            "bankverificationcharge": 0,
                            "description": dataWitdraw[0].description,
                            "status": dataWitdraw[0].status,
                            "noRek": dataakunbank._doc.noRek,
                            "namaRek": dataakunbank._doc.nama,
                            "namaBank": namabank
                        };
                    }
                } catch (e) {
                    throw new BadRequestException("Data not found...!");
                }
            } else {
                throw new BadRequestException("Data not found...!");
            }


        } catch (e) {
            throw new BadRequestException("Data not found...!");
        }
        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/transactions/historys/voucher')
    async finddata(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var key = null;
        var page = null;
        var status = null;
        var countrow = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var iduser = null;
        var totalpage = null;
        var descending = null;
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
        descending = request_json["descending"];
        key = request_json["key"];
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        iduser = request_json["iduser"];
        var userid = null;
        if (iduser !== undefined) {
            userid = mongoose.Types.ObjectId(iduser);
        } else {
            userid = undefined;
        }

        let data = await this.transactionsService.findhistoryBuyVoucher(key, userid, status, startdate, enddate, page, limit, descending);
        var total = data.length;
        let datasearch = await this.transactionsService.findhistoryBuyVoucherCount(key, userid, status, startdate, enddate);
        var total = data.length;
        var totalsearch = datasearch.length;
        var allrow = await this.transactionsService.totalcountVoucher();
        var totalallrow = allrow[0].countrow;
        var tpage = null;
        var tpage2 = null;
        if (iduser === undefined) {
            tpage2 = (totalallrow / limit).toFixed(0);
            tpage = (totalallrow % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }
        } else {
            tpage2 = (totalsearch / limit).toFixed(0);
            tpage = (totalsearch % limit);
            if (tpage > 0 && tpage < 5) {
                totalpage = parseInt(tpage2) + 1;

            } else {
                totalpage = parseInt(tpage2);
            }
        }


        return { response_code: 202, data, page, limit, total, totalsearch, totalallrow, totalpage, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/transactions/historys/voucher/detail')
    async finddatadetail(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var id = null;
        var arrdata = [];
        var objdata = {};

        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var idtr = mongoose.Types.ObjectId(id);
        let datatr = await this.transactionsService.findtransactiondetailvoucher(idtr);
        var detail = datatr[0].detail;
        var lenghdetail = detail.length;
        var data = [];

        for (var i = 0; i < lenghdetail; i++) {
            var idvc = detail[i].id.toString();
            var qty = detail[i].qty;
            var totalAmount = detail[i].totalAmount;
            let dtvoucher = await this.vouchersService.findOne(idvc);

            objdata = {
                "_id": dtvoucher._id,
                "noVoucher": dtvoucher.noVoucher,
                "codeVoucher": dtvoucher.codeVoucher,
                "userID": dtvoucher.userID,
                "nameAds": dtvoucher.nameAds,
                "creditValue": dtvoucher.creditValue,
                "creditPromo": dtvoucher.creditPromo,
                "creditTotal": dtvoucher.creditTotal,
                "createdAt": dtvoucher.createdAt,
                "expiredAt": dtvoucher.expiredAt,
                "amount": dtvoucher.amount,
                "qty": qty,
                "totalUsed": dtvoucher.totalUsed,
                "pendingUsed": dtvoucher.pendingUsed,
                "expiredDay": dtvoucher.expiredDay,
                "isActive": dtvoucher.isActive,
                "description": dtvoucher.description,
                "updatedAt": dtvoucher.updatedAt,
                "totalAmount": totalAmount
            }
            arrdata.push(objdata);
        }

        data = [
            {
                "_id": datatr[0]._id,
                "iduser": datatr[0].iduser,
                "type": datatr[0].type,
                "jenis": datatr[0].jenis,
                "timestamp": datatr[0].timestamp,
                "description": datatr[0].description,
                "noinvoice": datatr[0].noinvoice,
                "nova": datatr[0].nova,
                "expiredtimeva": datatr[0].expiredtimeva,
                "bank": datatr[0].bank,
                "amount": datatr[0].amount,
                "totalamount": datatr[0].totalamount,
                "status": datatr[0].status,
                "fullName": datatr[0].fullName,
                "email": datatr[0].email,
                "voucher_data": arrdata
            }
        ];

        return { response_code: 202, data, messages };
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
    @UseGuards(JwtAuthGuard)
    @Post('api/transactions/historys/voucherused')
    async finddatavoucheruse(@Req() request: Request): Promise<any> {
        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var descending = null;
        var page = null;
        var status = null;
        var countrow = null;
        var startdate = null;
        var enddate = null;
        var limit = null;
        var iduser = null;
        var totalpage = null;
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
        descending = request_json["descending"];
        status = request_json["status"];
        startdate = request_json["startdate"];
        enddate = request_json["enddate"];
        iduser = request_json["iduser"];
        var userid = mongoose.Types.ObjectId(iduser);
        let data = await this.adsService.listusevoucher(userid, status, startdate, enddate, page, limit, descending);
        var total = data.length;
        let datasearch = await this.adsService.listusevouchercount(userid, status, startdate, enddate);
        var total = data.length;
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



        return { response_code: 202, data, page, limit, total, totalsearch, totalpage, messages };
    }

    @Post('api/transactions/boostcontent')
    @HttpCode(HttpStatus.ACCEPTED)
    async postBost(@Headers() headers, @Body() body) {
        var DateTimeStamp = await this.utilsService.getDateTime();

        //VALIDASI HEADER
        if (headers['x-auth-user'] == undefined) {
            await this.errorHandler.generateNotAcceptableException(
                'Unauthorized',
            );
        }
        if (!(await this.utilsService.validasiTokenEmail(headers))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed email header dan token not match',
            );
        }

        var email = headers['x-auth-user'];
        //CECK USER
        var user = await this.userbasicsService.findOne(email);
        if (!(await this.utilsService.ceckData(user))) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, user not found',
            );
        }

        //VALIDASI PARAM DATESTART, TYPE
        if (body.dateStart == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed dateStart is required',
            );
        }
        if (body.dateEnd == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed dateEnd is required',
            );
        }
        if (body.type == undefined) {
            await this.errorHandler.generateBadRequestException(
                'Unabled to proceed type is required',
            );
        }

        //GET PRICE CONTENT BOOST
        const price = await this.utilsService.getSetting_("636212286f07000023005ce2");
        if (price == null) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Setting Price not found',
            );
        }

        //GET BANK CHANGE
        const BankVaCharge = await this.utilsService.getSetting_("62bd40e0f37a00001a004366");
        if (BankVaCharge == null) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Setting Bank Va Charge not found',
            );
        }

        //GET VA EXPIRED
        const ExpiredVa = await this.utilsService.getSetting_("6332caeb0c7d00004f005175");
        if (ExpiredVa == null) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Setting Expired Va not found',
            );
        }

        //CECK COUNT TRANSACTION
        var countTransaction = (await this.transactionsService.findAll()).length;

        //CALCULATION TOTAL AMOUNT
        var totalAmount = price + BankVaCharge;

        //SET VAR INTERVAL, SESSION
        let interval, session;

        //CECK PARAM TYPE MANUAL OR OTOMATIS
        if (body.type.toLowerCase() == "manual") {
            //CECK PARAM INTERVAL, SESSION
            if (body.interval == undefined) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed interval is required',
                );
            }
            if (body.session.toLowerCase() == undefined) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed session is required',
                );
            }

            //CECK INTERVAL
            interval = await this.boostintervalService.findById(body.interval);
            if (!(await this.utilsService.ceckData(interval))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, interval not found',
                );
            }

            //CECK SESSION
            session = await this.boostsessionService.findById(body.session);
            if (!(await this.utilsService.ceckData(session))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, session not found',
                );
            }
        } else if (body.type == "automatic") {
            //CECK INTERVAL
            interval = await this.boostintervalService.findByType("automatic");
            if (!(await this.utilsService.ceckData(interval))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, interval not found',
                );
            }

            //CECK SESSION
            session = await this.boostsessionService.findByType("automatic");
            if (!(await this.utilsService.ceckData(session))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, session not found',
                );
            }
        } else {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, type not found',
            );
        }

        //CECK PARAM BANK CODE
        if (body.bankcode != undefined) {
            //CECK PARAM POST ID
            if (body.postID == undefined) {
                await this.errorHandler.generateBadRequestException(
                    'Unabled to proceed postID is required',
                );
            }

            //CECK POST ID
            var post = await this.postsService.findByPostId(body.postID);
            if (!(await this.utilsService.ceckData(post))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, post not found',
                );
            }

            //CECK MEDIA POST ID
            var media = await this.postsService.findOnepostID(body.postID);
            if (!(await this.utilsService.ceckData(media))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, post not found',
                );
            }

            //CECK PARAM PAYMENT METHOD
            if (!(body.paymentmethod)) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, paymentmethod is required',
                );
            }

            //CECK PAYMENT METHOD
            var payment_method = await this.methodepaymentsService.findmethodename(body.paymentmethod);
            if (!(await this.utilsService.ceckData(payment_method))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, payment method not found',
                );
            }

            //CECK BANK CODE
            var bank = await this.utilsService.getBank(body.bankcode);
            if (!(await this.utilsService.ceckData(bank))) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed, Bank not found',
                );
            }

            //CECK PENDING TRANSACTION
            var daftarPending = await this.transactionsService.findPendingByUser(user._id.toString());
            if (!(await this.utilsService.ceckData(daftarPending))) {
                //CREATE VA PAYMENT
                var dataCreateVa = {
                    userId: user._id.toString(),
                    amount: totalAmount,
                    bankcode: body.bankcode,
                    name: user.fullName,
                    email: user.email,
                    valueexpiredva: ExpiredVa,
                }
                var Va = await this.createVa(dataCreateVa);

                //CREATE DATA TRANSACTION
                var transactionNumber = await this.utilsService.generateTransactionNumber(countTransaction);
                var typeTransaction = "BOOST_CONTENT";
                var date_trx_expiration_time = new Date(Va.trx_expiration_time);
                date_trx_expiration_time.setHours(date_trx_expiration_time.getHours() + 7);
                date_trx_expiration_time = new Date(date_trx_expiration_time);
                var transactionDetail = [
                    {
                        id: body.postID,
                        interval: interval,
                        session: session,
                        type: body.type,
                        dateStart: body.dateStart,
                        datedateEnd: body.dateEnd,
                        totalAmount: totalAmount,
                        qty: 1
                    }
                ];

                //CECK VA STATUS
                if (Va.status.code == "000") {
                    //INSERT DATA TRANSACTION
                    try {
                        var id_user_sell = await this.userbasicsService.findOne("tjikaljedy@hyppe.id")

                        let cekstatusva = await this.oyPgService.staticVaInfo(Va.id);
                        var createTransactionsDto_ = new CreateTransactionsDto();
                        createTransactionsDto_.iduserbuyer = Object(user._id.toString());
                        createTransactionsDto_.idusersell = Object(id_user_sell._id.toString());
                        createTransactionsDto_.timestamp = DateTimeStamp.toISOString();
                        createTransactionsDto_.updatedAt = DateTimeStamp.toISOString();
                        createTransactionsDto_.noinvoice = transactionNumber;
                        createTransactionsDto_.amount = price;
                        createTransactionsDto_.status = cekstatusva.va_status;
                        createTransactionsDto_.bank = Object(bank._id.toString());
                        createTransactionsDto_.idva = Va.id;
                        createTransactionsDto_.nova = Va.va_number;
                        createTransactionsDto_.accountbalance = null;
                        createTransactionsDto_.paymentmethod = Object(payment_method._id.toString());
                        createTransactionsDto_.ppn = null;
                        createTransactionsDto_.totalamount = totalAmount;
                        createTransactionsDto_.description = "buy " + typeTransaction + " pending";
                        createTransactionsDto_.payload = null;
                        createTransactionsDto_.type = typeTransaction;
                        createTransactionsDto_.expiredtimeva = date_trx_expiration_time.toISOString();
                        createTransactionsDto_.detail = transactionDetail;
                        createTransactionsDto_.postid = body.postID;
                        createTransactionsDto_.response = Va;
                        let transaction_boost = await this.transactionsService.create(createTransactionsDto_);
                        this.sendTransactionFCM(email, "BOOST_BUY", body.postID, email)
                        this.sendemail(email, "BOOST_BUY", transaction_boost);

                        var data_response_ = {
                            "noinvoice": transaction_boost.noinvoice,
                            "postid": transaction_boost,
                            "idusersell": transaction_boost.idusersell,
                            "iduserbuyer": transaction_boost.iduserbuyer,
                            "NamaPembeli": user.fullName,
                            "amount": transaction_boost.amount,
                            "paymentmethod": payment_method.methodename,
                            "status": transaction_boost.status,
                            "description": transaction_boost.description,
                            "idva": transaction_boost.idva,
                            "nova": transaction_boost.nova,
                            "expiredtimeva": transaction_boost.expiredtimeva,
                            "salelike": transaction_boost.saleview,
                            "saleview": transaction_boost.salelike,
                            "bank": bank.bankname,
                            "bankvacharge": BankVaCharge,
                            "detail": transactionDetail,
                            "totalamount": transaction_boost.totalamount,
                            "accountbalance": transaction_boost.accountbalance,
                            "timestamp": transaction_boost.timestamp,
                            "_id": transaction_boost._id
                        };
                    } catch (e) {
                        await this.errorHandler.generateNotAcceptableException(
                            'Unabled to proceed Error, ' + e
                        );
                    }
                    return {
                        response_code: 202,
                        data: data_response_,
                        messages: {
                            info: ['successfuly'],
                        },
                    };
                } else if (Va.status.code == "208") {
                    await this.errorHandler.generateNotAcceptableException(
                        'Request is Rejected (API Key is not Valid)',
                    );
                } else if (Va.status.code == "217") {
                    await this.errorHandler.generateNotAcceptableException(
                        'Request is Rejected (VA Number is still active for this partner user id)',
                    );
                } else {
                    await this.errorHandler.generateNotAcceptableException(
                        'Request is Rejected',
                    );
                }
            } else {
                const cekStatusVa = await this.oyPgService.staticVaInfo(daftarPending.idva);
                var expiredva = cekStatusVa.trx_expiration_time;
                var dex = new Date(expiredva);
                dex.setHours(dex.getHours() + 7);
                dex = new Date(dex);

                if (cekStatusVa.va_status === "WAITING_PAYMENT") {
                    await this.errorHandler.generateNotAcceptableException(
                        'Tidak dapat melanjutkan. Status konten ini dalan waiting payment',
                    );
                } else if (cekStatusVa.va_status === "STATIC_TRX_EXPIRED" || cekStatusVa.va_status === "EXPIRED") {
                    //CREATE VA PAYMENT
                    var dataCreateVa = {
                        userId: user._id.toString(),
                        amount: totalAmount,
                        bankcode: body.bankcode,
                        name: user.fullName,
                        email: user.email,
                        valueexpiredva: ExpiredVa,
                    }
                    var Va = await this.createVa(dataCreateVa);

                    //CREATE DATA TRANSACTION
                    var transactionNumber = await this.utilsService.generateTransactionNumber(countTransaction);
                    var typeTransaction = "BOOST_CONTENT";
                    var date_trx_expiration_time = new Date(Va.trx_expiration_time);
                    date_trx_expiration_time.setHours(date_trx_expiration_time.getHours() + 7);
                    date_trx_expiration_time = new Date(date_trx_expiration_time);
                    var transactionDetail = [
                        {
                            id: body.postID,
                            interval: interval,
                            session: session,
                            type: body.type,
                            dateStart: body.dateStart,
                            datedateEnd: body.dateEnd,
                            totalAmount: totalAmount,
                            qty: 1
                        }
                    ];

                    //CECK VA STATUS
                    if (Va.status.code == "000") {
                        //INSERT DATA TRANSACTION
                        try {
                            var id_user_sell = await this.userbasicsService.findOne("tjikaljedy@hyppe.id")

                            let cekstatusva = await this.oyPgService.staticVaInfo(Va.id);
                            var createTransactionsDto_ = new CreateTransactionsDto();
                            createTransactionsDto_.iduserbuyer = Object(user._id.toString());
                            createTransactionsDto_.idusersell = Object(id_user_sell._id.toString());
                            createTransactionsDto_.timestamp = DateTimeStamp.toISOString();
                            createTransactionsDto_.updatedAt = DateTimeStamp.toISOString();
                            createTransactionsDto_.noinvoice = transactionNumber;
                            createTransactionsDto_.amount = price;
                            createTransactionsDto_.status = cekstatusva.va_status;
                            createTransactionsDto_.bank = Object(bank._id.toString());
                            createTransactionsDto_.idva = Va.id;
                            createTransactionsDto_.nova = Va.va_number;
                            createTransactionsDto_.accountbalance = null;
                            createTransactionsDto_.paymentmethod = Object(payment_method._id.toString());
                            createTransactionsDto_.ppn = null;
                            createTransactionsDto_.totalamount = totalAmount;
                            createTransactionsDto_.description = "buy " + typeTransaction + " pending";
                            createTransactionsDto_.payload = null;
                            createTransactionsDto_.type = typeTransaction;
                            createTransactionsDto_.expiredtimeva = date_trx_expiration_time.toISOString();
                            createTransactionsDto_.detail = transactionDetail;
                            createTransactionsDto_.postid = body.postID;
                            createTransactionsDto_.response = Va;
                            let transaction_boost = await this.transactionsService.create(createTransactionsDto_);
                            this.sendTransactionFCM(email, "BOOST_BUY", body.postID, email)
                            this.sendemail(email, "BOOST_BUY", transaction_boost);

                            var data_response_ = {
                                "noinvoice": transaction_boost.noinvoice,
                                "postid": transaction_boost,
                                "idusersell": transaction_boost.idusersell,
                                "iduserbuyer": transaction_boost.iduserbuyer,
                                "NamaPembeli": user.fullName,
                                "amount": transaction_boost.amount,
                                "paymentmethod": payment_method.methodename,
                                "status": transaction_boost.status,
                                "description": transaction_boost.description,
                                "idva": transaction_boost.idva,
                                "nova": transaction_boost.nova,
                                "expiredtimeva": transaction_boost.expiredtimeva,
                                "salelike": transaction_boost.saleview,
                                "saleview": transaction_boost.salelike,
                                "bank": bank.bankname,
                                "bankvacharge": BankVaCharge,
                                "detail": transactionDetail,
                                "totalamount": transaction_boost.totalamount,
                                "accountbalance": transaction_boost.accountbalance,
                                "timestamp": transaction_boost.timestamp,
                                "_id": transaction_boost._id
                            };
                        } catch (e) {
                            await this.errorHandler.generateNotAcceptableException(
                                'Unabled to proceed Error, ' + e
                            );
                        }
                        return {
                            response_code: 202,
                            data: data_response_,
                            messages: {
                                info: ['successfuly'],
                            },
                        };
                    } else if (Va.status.code == "208") {
                        await this.errorHandler.generateNotAcceptableException(
                            'Request is Rejected (API Key is not Valid)',
                        );
                    } else if (Va.status.code == "217") {
                        await this.errorHandler.generateNotAcceptableException(
                            'Request is Rejected (VA Number is still active for this partner user id)',
                        );
                    } else {
                        await this.errorHandler.generateNotAcceptableException(
                            'Request is Rejected',
                        );
                    }
                }
            }
        } else {
            //CREATE RESPONSE
            var data = {};
            data["typeBoost"] = body.type;
            data["intervalBoost"] = interval;
            data["sessionBoost"] = session;
            data["dateBoostStart"] = body.dateStart;
            data["dateBoostEnd"] = body.dateEnd;
            data["priceBoost"] = price;
            data["priceBankVaCharge"] = BankVaCharge;
            data["priceTotal"] = totalAmount;

            var response = {
                "response_code": 202,
                "data": data,
                "messages": {
                    info: [
                        "Succesfully"
                    ]
                }
            }
            return response;
        }
    }

    async createVa(data: any) {
        var stringId = (await this.utilsService.generateNumber()).toString();
        var data_va = {
            "partner_user_id": data.userId.toString() + stringId,
            "amount": data.amount,
            "bank_code": data.bankcode,
            "is_open": false,
            "is_single_use": true,
            "is_lifetime": false,
            "username_display": data.name.toString(),
            "email": data.email,
            "trx_expiration_time": data.valueexpiredva,
        }

        try {
            var datareqva = await this.oyPgService.generateStaticVa(data_va);
            return datareqva;
        } catch (e) {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, ' + e,
            );
        }
    }

    async sendTransactionFCM(email: string, type: string, postID: string, receiverParty: string) {
        var Templates_ = new TemplatesRepo();
        Templates_ = await this.utilsService.getTemplate_repo(type, 'NOTIFICATION');

        var get_username_email = await this.utilsService.getUsertname(email);
        var get_username_receiverParty = await this.utilsService.getUsertname(receiverParty);

        var titlein = get_username_receiverParty?.toString() || '';
        var titleen = get_username_receiverParty?.toString() || '';
        var email_post = "";

        var posts = await this.postsService.findByPostId(postID);
        var bodyin = Templates_.body_detail_id.toString();
        var bodyen = Templates_.body_detail.toString();

        var post_type = "";
        if (await this.utilsService.ceckData(posts)) {
            post_type = posts.postType.toString();
            email_post = posts.email.toString();
        }

        var eventType = type.toString();
        var event = "TRANSACTION";
        await this.utilsService.sendFcm(email, titlein, titleen, bodyin, bodyen, eventType, event);
    }

    async sendemail(email: string, type: string, transaction_boost:any) {
        //Send Email
        try {
            //GET TEMPLATE HTML
            var Templates_ = new TemplatesRepo();
            Templates_ = await this.utilsService.getTemplate_repo(type, 'EMAIL');

            //GET USER LANGUAGE
            var profile = await this.utilsService.generateProfile(email, "FULL");
            if (!(await this.utilsService.ceckData(profile))) {
                console.log('ERROR', 'Unabled to proceed user not found, ' + email);
            }
            const langIso = (profile.langIso != undefined) ? profile.langIso : "id";

            //GET USER LANGUAGE
            var DataPost = await this.postsService.findByPostId(transaction_boost.postid);
            var postType = "-";
            if (await this.utilsService.ceckData(DataPost)){
                var DatapostType = DataPost.postType;
                postType = DatapostType[0].toUpperCase() + DatapostType.slice(1).toLowerCase();
            }

            //TEMPLATE HTML TO CHEERIO
            var html_body = "";
            if (langIso=="en"){
                html_body = Templates_.body_detail.trim().toString();
            } else {
                html_body = Templates_.body_detail_id.trim().toString();
            }
            const $_ = cheerio.load(html_body);

            //GET DATA BOOST
            var typeBoost = "-";
            var hargaBoost = "Rp 0";
            if (transaction_boost.detail.length>0){
                if (transaction_boost.detail[0].type != undefined) {
                    var DatapostTypeBoost = DataPost.postType;
                    typeBoost = DatapostTypeBoost[0].toUpperCase() + DatapostTypeBoost.slice(1).toLowerCase();
                }
                
            }

            //INSER VAR TO TEMPLATE
            $_('#fullname').text(profile.fullName);
            $_('#username').text(profile.username);
            $_('#postType').text("Hyppe" + postType);
            $_('#typeBoost').text(typeBoost);
            // $_('#hargaBoost').text(data.username);
            // $_('#biayaAdmin').text(data.username);
            // $_('#tanggalPemesanan').text(data.username);
            // $_('#kodePemesanan').text(data.username);
            // $_('#tanggalMulai').text(data.username);
            // $_('#waktuBoost').text(data.username);
            // $_('#selangWaktu').text(data.username);

            //var to = email;
            var to = email;
            var from = '"no-reply" <' + Templates_.from.toString() + '>';
            var subject = Templates_.subject.toString();
            var html_body_ = html_body;
            var send = await this.utilsService.sendEmail(
                to,
                from,
                subject,
                html_body_,
            );
            if (!send) {
                console.log('ERROR', 'Unabled to proceed Send Email, ' + email);
            }
        } catch (error) {
            console.log('ERROR', 'Unabled to proceed Send Email, ' + error);
        }
    }
}

