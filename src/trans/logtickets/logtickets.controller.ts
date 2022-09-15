import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { LogticketsService } from './logtickets.service';
import { CreateLogticketsDto } from './dto/create-logtickets.dto';
import { Logtickets } from './schemas/logtickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/logtickets')
export class LogticketsController {

    constructor(private readonly logticketsService: LogticketsService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateLogticketsDto: CreateLogticketsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.logticketsService.create(CreateLogticketsDto);
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

    @Post('history')
    @UseGuards(JwtAuthGuard)
    async retrieve(@Req() request: Request): Promise<any> {
        const mongoose = require('mongoose');
        var iduserticket = null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["iduserticket"] !== undefined) {
            iduserticket = request_json["iduserticket"];
        } else {
            throw new BadRequestException("Unabled to proceed");
        }

        var idticket = mongoose.Types.ObjectId(request_json["iduserticket"]);
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.logticketsService.findbyidticket(idticket);

        return { response_code: 202, data, messages };
    }
}
