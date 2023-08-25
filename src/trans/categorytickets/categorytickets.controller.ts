import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Request, Req, BadRequestException, Res, HttpStatus, Headers } from '@nestjs/common';
import { CategoryticketsService } from './categorytickets.service';
import { CreateCategoryticketsDto } from './dto/create-categorytickets.dto';
import { Categorytickets } from './schemas/categorytickets.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';
import { IsFullWidth } from 'class-validator';

@Controller('api/categorytickets')
export class CategoryticketsController {

    constructor(private readonly categoryticketsService: CategoryticketsService, 
        private readonly logapiSS: LogapisService,
        private readonly utilsService: UtilsService) { }


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
    // async findOne(@Param('id') id: string): Promise<Categorytickets> {
    //     return this.categoryticketsService.findOne(id);
    // }
    @UseGuards(JwtAuthGuard)
    @Get('all')
    async findAll(@Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.categoryticketsService.findAll();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

}
