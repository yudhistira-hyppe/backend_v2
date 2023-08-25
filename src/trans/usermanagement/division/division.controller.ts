import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param, Request, Headers } from '@nestjs/common';
import { DivisionService } from './division.service';
import { DivisionDto } from './dto/division.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Division } from './schemas/division.schema';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('/api/division')
export class DivisionController {
    constructor(
        private readonly divisionService: DivisionService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly logapiSS: LogapisService
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/division/create';
        var reqbody = JSON.parse(JSON.stringify(request));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (request.nameDivision == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create division param nameDivision is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var DivisionDto_ = new DivisionDto();
        DivisionDto_.nameDivision = request.nameDivision;
        DivisionDto_.createAt = current_date;
        DivisionDto_.updateAt = current_date;
        if (request.desc != undefined) {
            DivisionDto_.desc = request.desc;
        }
        await this.divisionService.create(DivisionDto_);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create division successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/all')
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Request() request,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (search == undefined) {
            search = "";
        }
        var data = await this.divisionService.findAll(search, skip, limit);
        var totalRow = (await this.divisionService.findAllCount(search)).length;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return {
            "response_code": 202,
            "totalRow": totalRow,
            "data": data,
            skip: skip,
            limit: limit,
            "messages": {
                "info": [
                    "Get list division successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async update(@Body() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/division/update';
        var reqbody = JSON.parse(JSON.stringify(request));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (request._id == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create division param _id is required',
            );
        }
        if (request.nameDivision == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create division param nameDivision is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var DivisionDto_ = new DivisionDto();
        DivisionDto_.nameDivision = request.nameDivision;
        DivisionDto_.updateAt = current_date;
        if (request.desc != undefined) {
            DivisionDto_.desc = request.desc;
        }
        await this.divisionService.update(request._id, DivisionDto_);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update division successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/:id')
    async findOne(@Param('id') id: string, @Headers() headers, @Request() request) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = await this.divisionService.findOne(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;

        // return this.divisionService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string, @Headers() headers, @Request() request) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var groupData = await this.divisionService.listGroupUserAllByDivisi(id)
        if (await this.utilsService.ceckData(groupData)){
            if (groupData.length>0){
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Delete division, Division in use',
                );
            }
        }
        var data = await this.divisionService.delete(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete division user successfully"
                ]
            },
        };
    }
}
