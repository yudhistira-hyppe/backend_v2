import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, BadRequestException, Headers } from '@nestjs/common';
import { AdsplacesService } from './adsplaces.service';
import { CreateAdsplacesDto } from './dto/create-adsplaces.dto';
import { Adsplaces } from './schemas/adsplaces.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { AdstypesService } from '../adstypes/adstypes.service';
import mongoose, { mongo } from 'mongoose';
import { type } from 'os';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('api/adsplaces')
export class AdsplacesController {

    constructor(private readonly adsplacesService: AdsplacesService,
        private readonly adstypeservice: AdstypesService,
        private readonly logapiSS: LogapisService,
        private readonly utilsService: UtilsService) { }

    // @UseGuards(JwtAuthGuard)
    // @Post()
    // async create(@Res() res, @Body() CreateAdsplacesDto: CreateAdsplacesDto, @Request() req) {
    //     const messages = {
    //         "info": ["The create successful"],
    //     };

    //     const messagesEror = {
    //         "info": ["Todo is not found!"],
    //     };

    //     try {
    //         let data = await this.adsplacesService.create(CreateAdsplacesDto);
    //         res.status(HttpStatus.OK).json({
    //             response_code: 202,
    //             "data": data,
    //             "message": messages
    //         });
    //     } catch (e) {
    //         res.status(HttpStatus.BAD_REQUEST).json({

    //             "message": messagesEror
    //         });
    //     }
    // }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateAdsplacesDto: CreateAdsplacesDto, @Request() req, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateAdsplacesDto));
        
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try
        {
            await this.adstypeservice.findOne(CreateAdsplacesDto.adsType);
        }
        catch (e) 
        {
            throw new BadRequestException("ads types data not found");
        }
        var importlib = require('mongoose');
        CreateAdsplacesDto.adsType = importlib.Types.ObjectId(CreateAdsplacesDto.adsType);

        try {
            let data = await this.adsplacesService.create(CreateAdsplacesDto);

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

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Headers() headers, @Request() request): Promise<Adsplaces[]> {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var data = await this.adsplacesService.findAll();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;

        // return this.adsplacesService.findAll();
    }

    //response API adsplace join dengan adstype
    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async detailAll(@Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var page = null;
        var limit = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed, page field is required");
        }

        if (request_json["limit"] !== undefined) {
            limit = Number(request_json["limit"]);
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed, limit field is required");
        }

        var data = await this.adsplacesService.getAll(page, limit);

        const messages = {
            "info": ["The process successful"],
        };

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return {
            response_code: 202,
            data:data,
            messages: messages,
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Headers() headers, @Request() request): Promise<Adsplaces> {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var data = await this.adsplacesService.findOne(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;
        
        // return this.adsplacesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adsplacesService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdsplaces: CreateAdsplacesDto, @Headers() headers, @Request() request) {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(createAdsplaces));

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try
        {
            await this.adstypeservice.findOne(createAdsplaces.adsType);
        }
        catch (e) 
        {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            throw new BadRequestException("ads types data not found");
        }
        var importlib = require('mongoose');
        createAdsplaces.adsType = importlib.Types.ObjectId(createAdsplaces.adsType);
        
        try {
            let data = await this.adsplacesService.update(id, createAdsplaces);

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
