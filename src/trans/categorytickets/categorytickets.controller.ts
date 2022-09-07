import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { CategoryticketsService } from './categorytickets.service';
import { CreateCategoryticketsDto } from './dto/create-categorytickets.dto';
import { Categorytickets } from './schemas/categorytickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/categorytickets')
export class CategoryticketsController {

    constructor(private readonly categoryticketsService: CategoryticketsService) { }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateCategoryticketsDto: CreateCategoryticketsDto, @Request() request) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.categoryticketsService.create(CreateCategoryticketsDto);
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
    // async findOne(@Param('id') id: string): Promise<Categorytickets> {
    //     return this.categoryticketsService.findOne(id);
    // }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll() {
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.categoryticketsService.findAll();

        return { response_code: 202, data, messages };
    }

}
