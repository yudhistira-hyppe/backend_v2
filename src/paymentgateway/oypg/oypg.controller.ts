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

<<<<<<< HEAD
    // @Post('/callback/va')
    // async callbackVa(@Body() payload: OyVaCallback) {

    //     console.log(payload);
    // }

=======
    @Post('/callback/va')
    async callbackVa(@Body() payload: OyVaCallback) {

        console.log(payload);
    }    
    
>>>>>>> e2128afa7190a14151c74f201939da971ca49996

    @Get('test')
    async test() {
        let ac = new OyAccountInquiry();
        ac.account_number = '1280259361'
        ac.bank_code = '014';

        const data = await this.oyPgService.inquiryAccount(ac);
        console.log(data);

        const bal = await this.oyPgService.myBalance();
        console.log(bal);
    }
}
