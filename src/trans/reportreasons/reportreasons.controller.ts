import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus, Headers, Head } from '@nestjs/common';
import { ReportreasonsService } from './reportreasons.service';
import { CreateReportreasonsDto } from './dto/create-reportreasons.dto';
import { Reportreasons } from './schemas/reportreasons.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('api/reportreasons')
export class ReportreasonsController {
    constructor(private readonly reportreasonsService: ReportreasonsService, private readonly utilsService: UtilsService, private readonly logapiSS: LogapisService) { }
    @UseGuards(JwtAuthGuard)
    @Post('all')
    async findAll(@Req() request: Request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/reportreasons/all';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var request_json = JSON.parse(JSON.stringify(request.body));
        const messages = {
            "info": ["The process successful"],
        };
        var lang = null;
        var type = null;

        lang = request_json["lang"];
        type = request_json["type"];

        var data = null;
        if (lang !== undefined) {
            data = await this.reportreasonsService.findLanguage(lang);
        }
        else if (type !== undefined) {
            data = await this.reportreasonsService.findTypekyc(type);
        }
        else {
            data = await this.reportreasonsService.findAll();
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }
    @UseGuards(JwtAuthGuard)
    @Get('type')
    async findtype(@Request() request, @Headers() headers): Promise<Reportreasons[]> {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = await this.reportreasonsService.findType();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;

        // return await this.reportreasonsService.findType();
    }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateReportreasonsDto: CreateReportreasonsDto, @Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateReportreasonsDto));
        
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };


        try {

            let data = await this.reportreasonsService.create(CreateReportreasonsDto);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }


    }


}
