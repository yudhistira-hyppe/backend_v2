import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, BadRequestException } from '@nestjs/common';
import { AdstypesService } from './adstypes.service';
import { CreateAdstypesDto } from './dto/create-adstypes.dto';
import { Adstypes } from './schemas/adstypes.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/adstypes')
export class AdstypesController {
    constructor(private readonly adstypesService: AdstypesService) { }
    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateAdstypesDto: CreateAdstypesDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypesService.create(CreateAdstypesDto);
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

    @UseGuards(JwtAuthGuard)
    @Get('detail')
    async findplaces(): Promise<Adstypes[]> {
        return this.adstypesService.findPlaces();
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Adstypes[]> {
        return this.adstypesService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Adstypes> {
        return this.adstypesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adstypesService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdstypesDto: CreateAdstypesDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypesService.update(id, createAdstypesDto);
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

    @UseGuards(JwtAuthGuard)
    @Post('listing')
    async detailAll(@Request() request) {
        var page = null;
        var limit = null;

        var request_json = JSON.parse(JSON.stringify(request.body));

        if (request_json["page"] !== undefined) {
            page = Number(request_json["page"]);
        } else {
            throw new BadRequestException("Unabled to proceed, page field is required");
        }

        if (request_json["limit"] !== undefined) {
            limit = Number(request_json["limit"]);
        } else {
            throw new BadRequestException("Unabled to proceed, limit field is required");
        }

        var data = await this.adstypesService.getAll(page, limit);

        const messages = {
            "info": ["The process successful"],
        };

        return {
            response_code: 202,
            data:data,
            messages: messages,
        };
    }
}
