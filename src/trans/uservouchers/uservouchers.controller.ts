import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers } from '@nestjs/common';
import { UservouchersService } from './uservouchers.service';
import { CreateUservouchersDto } from './dto/create-uservouchers.dto';
import { Uservouchers } from './schemas/uservouchers.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UserbasicsService } from '../userbasics/userbasics.service';

@Controller('uservouchers')
export class UservouchersController {
    constructor(private readonly uservouchersService: UservouchersService, private readonly userbasicsService: UserbasicsService,) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Headers('x-auth-token') auth: string, @Body() CreateUservouchersDto: CreateUservouchersDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };
        var token = auth;
        var reptoken = token.replace("Bearer ", "");
        var x = await this.parseJwt(reptoken);
        var email = x.email;

        var ubasic = await this.userbasicsService.findOne(email);


        var iduser = ubasic._id;
        var dt = new Date(Date.now());
        dt.setHours(dt.getHours() + 7); // timestamp
        dt = new Date(dt);


        try {

            CreateUservouchersDto.createdAt = dt.toISOString();
            CreateUservouchersDto.userID = iduser;
            let data = await this.uservouchersService.create(CreateUservouchersDto);
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


    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Uservouchers[]> {
        return this.uservouchersService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Uservouchers> {
        return this.uservouchersService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.uservouchersService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createUservouchersDto: CreateUservouchersDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            var dt = new Date(Date.now());

            createUservouchersDto.updatedAt = dt.toISOString();
            let data = await this.uservouchersService.update(id, createUservouchersDto);
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

    async generateNumber() {
        const getRandomId = (min = 0, max = 500000) => {
            min = Math.ceil(min);
            max = Math.floor(max);
            const num = Math.floor(Math.random() * (max - min + 1)) + min;
            return num.toString().padStart(6, "0")
        };
        return getRandomId();
    }

    async parseJwt(token) {

        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    };
}
