import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request } from '@nestjs/common';
import { LogapsarasService } from './logapsaras.service';
import { CreateLogapsarasDto } from './dto/create-logapsaras.dto';
import { Logapsaras } from './schemas/logapsaras.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/logapsaras')
export class LogapsarasController {
    constructor(private readonly logapsarasService: LogapsarasService) { }

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.logapsarasService.findAll();

        return { response_code: 202, data, messages };
    }


}
