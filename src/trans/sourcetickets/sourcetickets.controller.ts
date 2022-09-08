import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { SourceticketsService } from './sourcetickets.service';
import { CreateSourceticketsDto } from './dto/create-sourcetickets.dto';
import { Sourcetickets } from './schemas/sourcetickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/sourcetickets')
export class SourceticketsController {
    constructor(private readonly sourceticketsService: SourceticketsService) { }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateSourceticketsDto: CreateSourceticketsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.sourceticketsService.create(CreateSourceticketsDto);
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

    // @UseGuards(JwtAuthGuard)
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Sourcetickets> {
    //     return this.sourceticketsService.findOne(id);
    // }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.sourceticketsService.findAll();

        return { response_code: 202, data, messages };
    }


}
