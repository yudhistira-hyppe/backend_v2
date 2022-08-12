import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers, Req, BadRequestException } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVouchersDto } from './dto/create-vouchers.dto';
import { Vouchers } from './schemas/vouchers.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';

@Controller('api/vouchers')
export class VouchersController {
    constructor(private readonly vouchersService: VouchersService, private readonly userbasicsService: UserbasicsService,) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateVouchersDto: CreateVouchersDto, @Request() req) {
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


        var stringId = (await this.generateNumber()).toString();
        var kodevoucher = "VCR" + stringId;
        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);

        var dtexpired = new Date(CreateVouchersDto.expiredAt);
        var leng = 0;
        try {
            dataLast = await this.vouchersService.findExpired(CreateVouchersDto.expiredAt);
            leng = dataLast.length;

            for (var i = 0; i < leng; i++) {
                var id = dataLast[i]._id;
                await this.vouchersService.updatestatusActive(id, dt.toISOString());

            }

        } catch (e) {
            dataLast = null;
        }



        try {
            var creditValue = CreateVouchersDto.creditValue;
            var creditpromo = CreateVouchersDto.creditPromo;
            var total = creditValue + creditpromo;

            CreateVouchersDto.creditTotal = total;
            CreateVouchersDto.noVoucher = kodevoucher;
            CreateVouchersDto.createdAt = dt.toISOString();
            CreateVouchersDto.userID = iduser;
            CreateVouchersDto.totalUsed = 0;
            CreateVouchersDto.expiredAt = dtexpired.toISOString();
            let data = await this.vouchersService.create(CreateVouchersDto);


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
    @Get()
    async findAll(): Promise<Vouchers[]> {
        return this.vouchersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post('listactive')
    async findNonExpired(@Req() request: Request): Promise<any> {

        var request_json = JSON.parse(JSON.stringify(request.body));
        var expiredAt = "";
        if (request_json["expiredAt"] !== undefined) {
            expiredAt = request_json["expiredAt"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        return this.vouchersService.findExpirednactive(expiredAt);
    }

    @UseGuards(JwtAuthGuard)
    @Post('detail')
    async finddetail(@Req() request: Request): Promise<any> {

        var request_json = JSON.parse(JSON.stringify(request.body));
        var idvoucher = null;
        if (request_json["idvoucher"] !== undefined) {
            idvoucher = request_json["idvoucher"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var arrayId = [];
        var objid = {};
        for (var i = 0; i < idvoucher.length; i++) {
            var idv = idvoucher[i];
            var idvocer = mongoose.Types.ObjectId(idv);

            arrayId.push(idvocer);


        }
        let data = this.vouchersService.finddetailbuy(arrayId);

        console.log(data);
        return data;
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
