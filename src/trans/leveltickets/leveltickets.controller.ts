import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { LevelticketsService } from './leveltickets.service';
import { CreateLevelticketsDto } from './dto/create-leveltickets.dto';
import { Leveltickets } from './schemas/leveltickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/leveltickets')
export class LevelticketsController {
    constructor(private readonly levelticketsService: LevelticketsService) { }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateLevelticketsDto: CreateLevelticketsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.levelticketsService.create(CreateLevelticketsDto);
            return res.status(HttpStatus.OK).json({
                response_code: 202,
                "data": data,
                "message": messages
            });
        } catch (e) {
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
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.levelticketsService.findAll();

        return { response_code: 202, data, messages };
    }


}
