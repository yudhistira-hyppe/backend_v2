import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request } from '@nestjs/common';
import { AccountbalancesService } from './accountbalances.service';
import { CreateAccountbalancesDto } from './dto/create-accountbalances.dto';
import { Accountbalances } from './schemas/accountbalances.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';
@Controller('api/accountbalances')
export class AccountbalancesController {
    constructor(private readonly accountbalancesService: AccountbalancesService, private readonly userbasicsService: UserbasicsService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    async search(@Req() request: Request): Promise<any> {
        var email = null;
        var data = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["email"] !== undefined) {
            email = request_json["email"];
            var ubasic = await this.userbasicsService.findOne(email);

            var iduser = ubasic._id;
            data = await this.accountbalancesService.findsaldo(iduser);
        } else {
            data = await this.accountbalancesService.findsaldoall();
        }

        const messages = {
            "info": ["The process successful"],
        };


        return { response_code: 202, data, messages };
    }


}
