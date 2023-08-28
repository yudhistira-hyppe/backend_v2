import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param, Headers, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { ModuleService } from './module.service'; 
import { ModuleDto } from './dto/module.dto';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('api/module')
export class ModuleController {
    constructor(
        private readonly moduleService: ModuleService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly logapiSS: LogapisService
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request, @Headers() headers) {
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/module/create";
        var reqbody = JSON.parse(JSON.stringify(request));
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (request.nameModule == undefined) {
            var timestamp_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param nameModule is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var ModuleDto_ = new ModuleDto();
        ModuleDto_.nameModule = request.nameModule;
        ModuleDto_.createAt = current_date;
        ModuleDto_.updateAt = current_date;
        if (request.desc != undefined) {
            ModuleDto_.desc = request.desc;
        }
        await this.moduleService.create(ModuleDto_);

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create module successfully"
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
        @Headers() headers,
        @Request() request) {
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (search == undefined) {
            search = "";
        }
        if (skip == undefined) {
            skip = 0;
        }
        if (limit == undefined) {
            limit = 10;
        }
        var data = await this.moduleService.findAll(search, Number(skip), Number(limit));
        var totalRow = (await this.moduleService.findAllCount(search)).length;

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, null);

        return {
            "response_code": 202, 
            "totalRow": totalRow,
            "data": data,
            skip: skip,
            limit: limit,
            "messages": {
                "info": [
                    "Get list module successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async update(@Body() request, @Headers() headers) {
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/module/update";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request));

        if (request._id == undefined) {
            var timestamp_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param _id is required',
            );
        }
        if (request.nameModule == undefined) {
            var timestamp_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create module param nameModule is required',
            );
        }
        var current_date = await this.utilsService.getDateTimeString();
        var ModuleDto_ = new ModuleDto();
        ModuleDto_.nameModule = request.nameModule;
        ModuleDto_.updateAt = current_date;
        if (request.desc != undefined) {
            ModuleDto_.desc = request.desc;
        }
        await this.moduleService.update(request._id, ModuleDto_);

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update module successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string,
        @Headers() headers,
        @Request() request) {
        var timestamp_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + "/api/module/delete";
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        
        var data = await this.moduleService.delete(id);

        var timestamp_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, null);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete module successfully"
                ]
            },
        };
    }
}
