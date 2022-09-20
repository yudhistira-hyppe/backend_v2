import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { RemovedreasonsService } from './removedreasons.service';
import { CreateRemovedreasonsDto } from './dto/create-removedreasons.dto';
import { Removedreasons } from './schemas/removedreasons.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/removedreasons')
export class RemovedreasonsController {
    constructor(private readonly removedreasonsService: RemovedreasonsService) { }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.removedreasonsService.findAll();

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateRemovedreasonsDto: CreateRemovedreasonsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };


        try {

            let data = await this.removedreasonsService.create(CreateRemovedreasonsDto);
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
