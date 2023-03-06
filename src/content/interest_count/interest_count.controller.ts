import { Body, Controller, Get, Param, Post, UseGuards, Req, Request, Logger, BadRequestException, HttpStatus, Put, Res } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InterestCountService } from './interest_count.service';

@Controller('api/interest-count')
export class InterestCountController {

    constructor(private readonly interestCountService: InterestCountService){ }

    @Post('default-page')
    @UseGuards(JwtAuthGuard)
    async keywordDefaultPage(@Req() request: Request): Promise<any> {
        var data = null;
        var page = null;
        var limit = null;

        const messages = {
            "info": ["The process successful"],
        };

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["limit"] !== undefined) {
            limit = (Number(request_json["limit"]) !== parseInt('0') ? Number(request_json["limit"]) : parseInt('10'));
        }
        else {
            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        }
        else {
            throw new BadRequestException("Unabled to proceed");
        }

        var getdata = null;
        try{
            getdata = await this.interestCountService.searchDefaultPage(page, limit);
            getdata = getdata[0];
        }
        catch (e){
            getdata = [];
        }

        return { response_code:202, data : getdata, limit : limit, page : page, messages  }
    }
}
