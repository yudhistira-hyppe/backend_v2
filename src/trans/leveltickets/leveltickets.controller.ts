import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus, Headers } from '@nestjs/common';
import { LevelticketsService } from './leveltickets.service';
import { CreateLevelticketsDto } from './dto/create-leveltickets.dto';
import { Leveltickets } from './schemas/leveltickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('api/leveltickets')
export class LevelticketsController {
    constructor(private readonly levelticketsService: LevelticketsService, private readonly utilsService: UtilsService, private readonly logapiSS: LogapisService) { }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateLevelticketsDto: CreateLevelticketsDto, @Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(CreateLevelticketsDto));
        
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.levelticketsService.create(CreateLevelticketsDto);

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

    // @UseGuards(JwtAuthGuard)
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Leveltickets> {
    //     return this.levelticketsService.findOne(id);
    // }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll(@Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.levelticketsService.findAll();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }


}
