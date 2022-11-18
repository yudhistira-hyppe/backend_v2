import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { ReportreasonsService } from './reportreasons.service';
import { CreateReportreasonsDto } from './dto/create-reportreasons.dto';
import { Reportreasons } from './schemas/reportreasons.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/reportreasons')
export class ReportreasonsController {
    constructor(private readonly reportreasonsService: ReportreasonsService) { }
    @UseGuards(JwtAuthGuard)
    @Post('all')
    async findAll(@Req() request: Request) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        const messages = {
            "info": ["The process successful"],
        };
        var lang = null;

        lang = request_json["lang"];

        var data = null;
        if (lang !== undefined) {
            data = await this.reportreasonsService.findLanguage(lang);
        } else {
            data = await this.reportreasonsService.findAll();
        }

        return { response_code: 202, data, messages };
    }
    @UseGuards(JwtAuthGuard)
    @Get('type')
    async findtype(): Promise<Reportreasons[]> {
        return await this.reportreasonsService.findType();
    }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateReportreasonsDto: CreateReportreasonsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };


        try {

            let data = await this.reportreasonsService.create(CreateReportreasonsDto);
            res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
            res.status(HttpStatus.BAD_REQUEST).json({

                "message": messagesEror
            });
        }


    }


}
