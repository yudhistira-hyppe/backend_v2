import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks } from './schemas/banks.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller()
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @UseGuards(JwtAuthGuard)
    @Get('api/banks/:id')
    async findOne(@Param('id') id: string): Promise<Banks> {
        return this.banksService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Get('api/banks/all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findAll();

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/search')
    async findbank(@Req() request: Request) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var bankcode = null;
        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findbankcode(bankcode);

        return { response_code: 202, data, messages };
    }



}
