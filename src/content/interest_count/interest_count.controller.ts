import { Body, Controller, Get, Param, Post, UseGuards, Req, Request, Logger, BadRequestException, HttpStatus, Put, Res, Headers } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { InterestCountService } from './interest_count.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('api/interest-count')
export class InterestCountController {

    constructor(private readonly interestCountService: InterestCountService,
        private readonly logapiSS:LogapisService,
        private readonly utilsService: UtilsService){ }

    @Post('default-page')
    @UseGuards(JwtAuthGuard)
    async keywordDefaultPage(@Req() request: Request, @Headers() headers): Promise<any> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/interest-count/default-page";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

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
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }

        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        }
        else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

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

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, request_json);

        return { response_code:202, data : getdata, limit : limit, page : page, messages  }
    }
}
