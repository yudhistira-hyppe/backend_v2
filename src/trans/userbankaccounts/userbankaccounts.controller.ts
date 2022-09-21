import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { UserbankaccountsService } from './userbankaccounts.service';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Userbankaccounts } from './schemas/userbankaccounts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { BanksService } from '../banks/banks.service';
import { MediaproofpictsService } from '../../content/mediaproofpicts/mediaproofpicts.service';
import { isLowercase } from 'class-validator';
@Controller('api/userbankaccounts')
export class UserbankaccountsController {
    constructor(private readonly userbankaccountsService: UserbankaccountsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly banksService: BanksService,
        private readonly mediaproofpictsService: MediaproofpictsService,) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateUserbankaccountsDto: CreateUserbankaccountsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var email = null;
        var noRek = null;
        var bankcode = null;
        var nama = null;
        var idbank = null;
        var datamediaprof = null;
        var datarekkembar = null;
        var namamediaprof = null;
        var language = null;
        var messageRespon = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["language"] !== undefined) {
            language = request_json["language"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }


        if (request_json["noRek"] !== undefined) {
            noRek = request_json["noRek"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        if (request_json["nama"] !== undefined) {
            nama = request_json["nama"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (language === "id") {
            messageRespon = "Nama yang Anda masukkan salah, pastikan nama yang Anda masukkan sesuai dengan ID yang terdaftar di hyppe";
        }
        else if (language === "en") {
            messageRespon = "The name you entered is wrong, make sure the name you enter matches the ID registered on hyppe"
        }
        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;
        var proofPict_json = JSON.parse(JSON.stringify(ubasic.proofPict));
        var id_mediaproofpicts = proofPict_json.$id;
        try {
            datamediaprof = await this.mediaproofpictsService.findOne(id_mediaproofpicts);
            namamediaprof = datamediaprof.nama.toLowerCase();
        } catch (e) {
            datamediaprof = null;
            namamediaprof = "";
        }


        try {
            datarekkembar = await this.userbankaccountsService.findnorekkembar(noRek);
        } catch (e) {
            datarekkembar = null;
        }
        var lownama = nama.toLowerCase();

        var databank = null;
        var namabank = "";
        try {
            databank = await this.banksService.findbankcode(bankcode);
            namabank = databank._doc.bankname;
            idbank = databank._doc._id;

        } catch (e) {
            throw new BadRequestException("Banks not found...!");
        }
        if (datarekkembar === null) {

            if (lownama === namamediaprof) {
                try {
                    CreateUserbankaccountsDto.userId = iduser;
                    CreateUserbankaccountsDto.noRek = noRek;
                    CreateUserbankaccountsDto.idBank = idbank;
                    CreateUserbankaccountsDto.statusInquiry = false;
                    CreateUserbankaccountsDto.active = true;

                    let data = await this.userbankaccountsService.create(CreateUserbankaccountsDto);
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "data": data,
                        "message": messages
                    });
                } catch (e) {
                    res.status(HttpStatus.OK).json({
                        response_code: 202,
                        "message": messagesEror
                    });
                }
            } else {
                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messageRespon
                });
            }

        } else {
            throw new BadRequestException("account number already exists..!");
        }

    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createUserbankaccountsDto: CreateUserbankaccountsDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.userbankaccountsService.update(id, createUserbankaccountsDto);
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


    @Post('byuser')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var email = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        var datauserbasicsService = null;
        var iduser = null;
        //Ceck User Userbasics
        try {
            datauserbasicsService = await this.userbasicsService.findOne(email);
        } catch (e) {
            throw new BadRequestException("User not found");
        }
        const messages = {
            "info": ["The process successful"],
        };

        iduser = mongoose.Types.ObjectId(datauserbasicsService._id);
        let data = await this.userbankaccountsService.findOneUser(iduser);

        return { response_code: 202, data, messages };
    }

    @Post('delete')
    @UseGuards(JwtAuthGuard)
    async delete(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var ObjectId = require('mongodb').ObjectId;
        var id = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["id"] !== undefined) {
            id = request_json["id"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The delete successful"],
        };

        var _id = mongoose.Types.ObjectId(id);
        let data = await this.userbankaccountsService.updateactive(_id);

        return { response_code: 202, messages };
    }

}
