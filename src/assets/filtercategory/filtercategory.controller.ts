import { Controller, Get, Post, Body, Patch, Req, UseGuards, Res, Headers, Param,  } from '@nestjs/common';
import * as mongoDB from 'mongoose';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FiltercategoryService } from './filtercategory.service';
import { ErrorHandler } from 'src/utils/error.handler';

@Controller('api/filtercategory')
export class FiltercategoryController {
    constructor(
        private readonly utilSS: UtilsService,
        private readonly logapiSS: LogapisService,
        private readonly filterService: FiltercategoryService,
        private readonly errorHandler: ErrorHandler
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Headers() headers, @Req() request)
    {
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilSS.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json['name'] == null || request_json['name'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, name field is required',
            );
        }

        if(request_json['active'] == null || request_json['active'] == undefined)
        {
            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, active field is required',
            );
        }

        var insertdata = new CreateFilterDto();
        insertdata._id = new mongoDB.Types.ObjectId();
        insertdata.name = request_json['name'];
        insertdata.active = request_json['active'];
        insertdata.createdAt = await this.utilSS.getDateTimeString();
        insertdata.updatedAt = await this.utilSS.getDateTimeString();

        await this.filterService.create(insertdata);

        var timestamp_end = await this.utilSS.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code:202,
            data:insertdata,
            message:messages
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('list')
    async listing(@Headers() headers, @Req() request)
    {
        var page = 0;
        var skip = 0;
        var name = null;
        
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilSS.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var request_json = JSON.parse(JSON.stringify(request.body));

        if(request_json['page'] != null && request_json['page'] != undefined)
        {
            page = parseInt(request_json['page']);
        }

        if(request_json['limit'] != null && request_json['limit'] != undefined)
        {
            skip = parseInt(request_json['limit']);
        }

        if(request_json['name'] != null && request_json['name'] != undefined)
        {
            name = request_json['search'];
        }

        var data = await this.filterService.listing(name, skip, page);
        var timestamp_end = await this.utilSS.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            "response_code":202,
            "data":data,
            "message":messages
        } 
    }

    @Get(':id')
    async detail(@Headers() headers, @Param() id:string, @Req() request)
    {
        var data = await this.filterService.findOne(id);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            "response_code":202,
            "data":data,
            "message":messages
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('update/:id')
    async update(@Headers() headers, @Param() id: string, @Req() request)
    {
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var timestamp_start = await this.utilSS.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;

        var updatedata = new CreateFilterDto();

        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json['name'] != null && request_json['name'] != undefined)
        {
            updatedata.name = request_json['name'];
        }

        if(request_json['active'] != null && request_json['active'] != undefined)
        {
            updatedata.active = request_json['active'];
        }

        updatedata.updatedAt = await this.utilSS.getDateTimeString();

        await this.filterService.update(id, updatedata);

        var timestamp_end = await this.utilSS.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code:202,
            data:updatedata,
            message:messages
        }
    }

    // masih salah. nunggu info lebih lanjut
    // @UseGuards(JwtAuthGuard)
    // @Post('delete/:id')
    // async delete(@Headers() headers, @Param() id: string, @Req() request)
    // {
    //     var token = headers['x-auth-token'];
    //     var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    //     var email = auth.email;
    //     var timestamp_start = await this.utilSS.getDateTimeString();
    //     var fullurl = request.get("Host") + request.originalUrl;

    //     var updatedata = new CreateFilterDto();

    //     var request_json = JSON.parse(JSON.stringify(request.body));
    //     if(request_json['active'] == null || request_json['active'] == undefined)
    //     {
    //         await this.errorHandler.generateNotAcceptableException(
    //             'Unabled to proceed, active field is required',
    //         );
    //     }
        
    //     updatedata.active = request_json['active'];
    //     updatedata.updatedAt = await this.utilSS.getDateTimeString();

    //     await this.filterService.update(id, updatedata);

    //     var timestamp_end = await this.utilSS.getDateTimeString();
    //     this.logapiSS.create2(fullurl, timestamp_start, timestamp_end, email, null, null, request_json);

    //     const messages = {
    //         "info": ["The process successful"],
    //     };

    //     return {
    //         response_code:202,
    //         data:updatedata,
    //         message:messages
    //     }
    // }
}
