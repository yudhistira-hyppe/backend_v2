import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, BadRequestException, Headers } from '@nestjs/common';
import { AdstypesService } from './adstypes.service';
import { CreateAdstypesDto } from './dto/create-adstypes.dto';
import { Adstypes } from './schemas/adstypes.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';
import { request } from 'http';

@Controller('api/adstypes')
export class AdstypesController {
    constructor(private readonly adstypesService: AdstypesService,
        private readonly logapiSS: LogapisService,
        private readonly utilsService: UtilsService) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateAdstypesDto: CreateAdstypesDto, @Request() req, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateAdstypesDto));

        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypesService.create(CreateAdstypesDto);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('detail')
    async findplaces(@Headers() headers, @Request() request): Promise<Adstypes[]> {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var data = await this.adstypesService.findPlaces();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;

        // return this.adstypesService.findPlaces();
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(@Headers() headers, @Request() request): Promise<Adstypes[]> {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var data = await this.adstypesService.findAll();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;
        
        // return this.adstypesService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string, @Headers() headers, @Request() request): Promise<Adstypes> {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        
        var data = await this.adstypesService.findOne(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return data;
        
        // return this.adstypesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adstypesService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdstypesDto: CreateAdstypesDto, @Headers() headers, @Request() request) {
        var timestamps_start = await this.utilsService.getDateTimeString();    
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var fullurl = request.get("Host") + request.originalUrl;
        var reqbody = JSON.parse(JSON.stringify(createAdstypesDto));

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypesService.update(id, createAdstypesDto);

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }
    }

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

        var data = await this.adstypesService.getAll(page, limit);

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
}
