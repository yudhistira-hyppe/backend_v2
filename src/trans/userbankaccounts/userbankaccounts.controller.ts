import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { UserbankaccountsService } from './userbankaccounts.service';
import { CreateUserbankaccountsDto } from './dto/create-userbankaccounts.dto';
import { Userbankaccounts } from './schemas/userbankaccounts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { BanksService } from '../banks/banks.service';

@Controller('api/userbankaccounts')
export class UserbankaccountsController {
    constructor(private readonly userbankaccountsService: UserbankaccountsService,
        private readonly userbasicsService: UserbasicsService,
        private readonly banksService: BanksService,) { }

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
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
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
        var ubasic = await this.userbasicsService.findOne(email);

        var iduser = ubasic._id;

        var datarekkembar = null;

        try {
            datarekkembar = await this.userbankaccountsService.findnorekkembar(noRek);
        } catch (e) {
            datarekkembar = null;
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
        if (datarekkembar === null) {
            try {
                CreateUserbankaccountsDto.userId = iduser;
                CreateUserbankaccountsDto.noRek = noRek;
                CreateUserbankaccountsDto.idBank = idbank;
                CreateUserbankaccountsDto.statusInquiry = false;
                CreateUserbankaccountsDto.nama;

                let data = await this.userbankaccountsService.create(CreateUserbankaccountsDto);
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
}
