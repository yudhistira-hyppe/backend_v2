import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, Req, BadRequestException } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVouchersDto } from './dto/create-vouchers.dto';
import { Vouchers } from './schemas/vouchers.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { SettingsService } from '../settings/settings.service';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';
import { AdsPriceCreditsService } from '../adsv2/adspricecredits/adspricecredits.service';
@Controller('api/vouchers')
export class VouchersController {
    constructor(private readonly vouchersService: VouchersService,
        private readonly adsPriceCreditsService: AdsPriceCreditsService, private readonly userbasicsService: UserbasicsService, private readonly settingsService: SettingsService, private readonly logapiSS: LogapisService, private readonly utilsService: UtilsService) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateVouchersDto: CreateVouchersDto, @Request() req, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/vouchers';
        var settoken = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(settoken.split('.')[1], 'base64').toString());
        var email = setauth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateVouchersDto));

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
        var dataLast = null;

        var curdate = new Date(Date.now());
        var beforedate = curdate.toISOString();

        var substrtahun = beforedate.substring(0, 4);
        var numtahun = parseInt(substrtahun);

        var substrbulan = beforedate.substring(7, 5);
        var numbulan = parseInt(substrbulan);
        var substrtanggal = beforedate.substring(10, 8);
        var numtanggal = parseInt(substrtanggal);

        var stringId = (await this.generateNumber()).toString();
        var kodevoucher = "VCR/" + substrtahun + "/" + substrbulan + "/" + substrtanggal + "/" + stringId;
        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var exday = CreateVouchersDto.expiredDay;

        var d = new Date();
        d.setDate(d.getDate() + exday);
        d = new Date(d);

        // var dtexpired = new Date(CreateVouchersDto.expiredAt);
        // var leng = 0;
        // try {
        //     dataLast = await this.vouchersService.findExpired(CreateVouchersDto.expiredAt);
        //     leng = dataLast.length;

        //     for (var i = 0; i < leng; i++) {
        //         var id = dataLast[i]._id;
        //         await this.vouchersService.updatestatusActive(id, dt.toISOString());

        //     }

        // } catch (e) {
        //     dataLast = null;
        // }



        try {
            var creditValue = CreateVouchersDto.creditValue;
            var creditpromo = CreateVouchersDto.creditPromo;
            var total = creditValue + creditpromo;

            var getSetting_CreditPrice = await this.adsPriceCreditsService.findStatusActive();
            var aamount = ((getSetting_CreditPrice.creditPrice != undefined) ? getSetting_CreditPrice.creditPrice : 0) * total;

            CreateVouchersDto.creditTotal = total;
            CreateVouchersDto.noVoucher = kodevoucher;
            CreateVouchersDto.createdAt = dt.toISOString();
            CreateVouchersDto.userID = iduser;
            CreateVouchersDto.totalUsed = 0;
            CreateVouchersDto.expiredAt = d.toISOString();
            CreateVouchersDto.pendingUsed = 0;
            CreateVouchersDto.amount = aamount;
            let data = await this.vouchersService.create(CreateVouchersDto);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Vouchers[]> {
        return this.vouchersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('list')
    async finddata(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/vouchers/list';
        var settoken = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(settoken.split('.')[1], 'base64').toString());
        var email = setauth.email;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));
        var key = null;
        var page = null;

        var limit = null;
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
        key = request_json["key"];

        let data = await this.vouchersService.finddata(key, page, limit);
        var total = data.length;
        let datasearch = await this.vouchersService.finddataCount(key);
        var total = data.length;
        var totalsearch = datasearch.length;
        var allrow = await this.vouchersService.totalcount();
        var totalallrow = allrow[0].countrow;
        var totalpage = totalallrow / limit;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, page, limit, total, totalsearch, totalallrow, totalpage, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findid(@Param('id') id: string, @Headers() headers, @Req() request): Promise<Vouchers> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var settoken = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(settoken.split('.')[1], 'base64').toString());
        var email = setauth.email;
        
        var data = await this.vouchersService.findOne(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;

        // return this.vouchersService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Post('listactive')
    async findNonExpired(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/vouchers/listactive';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        var expiredAt = "";
        if (request_json["expiredAt"] !== undefined) {
            expiredAt = request_json["expiredAt"];
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        var data = await this.vouchersService.findExpirednactive(expiredAt);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return data;
        // return this.vouchersService.findExpirednactive(expiredAt);
    }

    @UseGuards(JwtAuthGuard)
    @Put('update/:id')
    async updatedata(@Res() res, @Param('id') id: string, @Body() CreateVouchersDto: CreateVouchersDto, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/vouchers/update/' + id;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateVouchersDto));

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var datavoucher = null;
        var d = null;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);
        var exday = null;
        var createdAt = null;
        var creditValue = 0;
        var creditPromo = 0;
        var creditTotal = 0;

        try {
            datavoucher = await this.vouchersService.findByid(id);
            createdAt = datavoucher.createdAt;
            d = new Date(createdAt);
            d.setHours(d.getHours() - 7);
        } catch (e) {
            datavoucher = null;
            createdAt = "";
            d = new Date();
        }

        try {

            try {
                exday = CreateVouchersDto.expiredDay;
                d.setDate(d.getDate() + exday);
                d = new Date(d);
                CreateVouchersDto.expiredAt = d.toISOString();

            } catch (e) {
                exday = null;

            }
            try {
                creditValue = CreateVouchersDto.creditValue;
                creditPromo = CreateVouchersDto.creditPromo;
                creditTotal = creditValue + creditPromo;
            } catch (e) {
                creditTotal = 0;
            }

            CreateVouchersDto.updatedAt = dt.toISOString();
            CreateVouchersDto.creditTotal = creditTotal;
            let data = await this.vouchersService.update(id, CreateVouchersDto);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "message": messages
            });
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror + " " + e
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('detail')
    async finddetail(@Res() res, @Req() request: Request): Promise<any> {

        var request_json = JSON.parse(JSON.stringify(request.body));
        var idvoucher = null;
        if (request_json["idvoucher"] !== undefined) {
            idvoucher = request_json["idvoucher"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var arrayId = [];
        var objid = {};
        var arrayqty = [];
        var arraymount = [];
        var arrayCredittotal = [];
        var idmdradmin = "62bd413ff37a00001a004369";
        var datamradmin = null;
        var tamount = 0;
        var sum = 0;
        var sumCredittotal = 0;
        var sumqty = 0;
        for (var i = 0; i < idvoucher.length; i++) {
            var idv = idvoucher[i].id;
            var qty = idvoucher[i].qty;
            var price = idvoucher[i].price;
            var totalAmount = qty * price;


            var datavoucher = this.vouchersService.findOne(idv);
            var tCreditTotal = qty * (await datavoucher).creditTotal;
            objid = {
                "id": idvoucher[i].id,
                "noVoucher": (await datavoucher).noVoucher,
                "codeVoucher": (await datavoucher).codeVoucher,
                "nameAds": (await datavoucher).nameAds,
                "creditTotal": (await datavoucher).creditTotal,
                "expiredAt": (await datavoucher).expiredAt,
                "qty": qty,
                "price": price,
                "totalPrice": totalAmount,
                "totalCredit": tCreditTotal
            };
            arrayId.push(objid);
            arraymount.push(totalAmount);
            arrayCredittotal.push(tCreditTotal);
            arrayqty.push(qty);

        }
        for (var i = 0; i < arraymount.length; i++) {
            sum += arraymount[i];
        };

        for (var i = 0; i < arrayCredittotal.length; i++) {
            sumCredittotal += arrayCredittotal[i];
        };

        for (var i = 0; i < arrayqty.length; i++) {
            sumqty += arrayqty[i];
        };
        try {

            datamradmin = await this.settingsService.findOne(idmdradmin);
            var valuemradmin = datamradmin._doc.value;
            var nominalmradmin = sum * valuemradmin / 100;

            tamount = sum + nominalmradmin;



        } catch (e) {
            tamount = sum + 0;
            nominalmradmin = 0;
        }


        try {
            var data = { "orderList": arrayId, "totalAmount": tamount, "adminCharge": nominalmradmin, "prosentaseAdmin": valuemradmin + ' %', "totalCredit": sumCredittotal, "totalVoucher": sumqty };
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
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Vouchers> {
        return this.vouchersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.vouchersService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createVouchersDto: CreateVouchersDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            var dt = new Date(Date.now());

            createVouchersDto.updatedAt = dt.toISOString();
            let data = await this.vouchersService.update(id, createVouchersDto);
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
}
