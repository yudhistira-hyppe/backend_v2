import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OyPgService } from './oypg.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OyAccountInquiry, OyAccountInquiryResponse, OyDisburseCallback, OyVaCallback } from './dto/OyDTO';

@Controller('api/pg/oy')
export class OyPgController {
    constructor(private readonly oyPgService: OyPgService) { }

    @Post('/callback/disbursement')
    async callbackDisbursement(@Body() payload: OyDisburseCallback) {

        console.log(payload);

    }

    // @Post('/callback/va')
    // async callbackVa(@Body() payload: OyVaCallback) {

    //     console.log(payload);
    // }


    @Get('test')
    async test() {
        let ac = new OyAccountInquiry();
        ac.account_number = '12802593612'
        ac.bank_code = '014';

        const data = await this.oyPgService.inquiryAccount(ac);
        console.log(data);

        const bal = await this.oyPgService.myBalance();
        console.log(bal);
    }
}
