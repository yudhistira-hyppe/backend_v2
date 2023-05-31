import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, BadRequestException } from '@nestjs/common';
import { AdstypeService } from './adstype.service';
import { AdsTypeDto } from './dto/adstype.dto';
import { Adstype } from './schemas/adstype.schema';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';

@Controller('api/adsv2/adstypes')
export class AdstypesController {
    constructor(private readonly adstypeService: AdstypeService) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() AdsTypeDto_: AdsTypeDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypeService.create(AdsTypeDto_);
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
    async findplaces(): Promise<Adstype[]> {
        return this.adstypeService.findPlaces();
    }
    
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Adstype[]> {
        return this.adstypeService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Adstype> {
        return this.adstypeService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adstypeService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() AdsTypeDto_: AdsTypeDto) {
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adstypeService.update(id, AdsTypeDto_);
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

        var data = await this.adstypeService.getAll(page, limit);

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
