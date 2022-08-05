import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put } from '@nestjs/common';
import { AdsplacesService } from './adsplaces.service';
import { CreateAdsplacesDto } from './dto/create-adsplaces.dto';
import { Adsplaces } from './schemas/adsplaces.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/adsplaces')
export class AdsplacesController {

    constructor(private readonly adsplacesService: AdsplacesService) { }


    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Body() CreateAdsplacesDto: CreateAdsplacesDto, @Request() req) {
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adsplacesService.create(CreateAdsplacesDto);
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
    async findAll(): Promise<Adsplaces[]> {
        return this.adsplacesService.findAll();
    }
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Adsplaces> {
        return this.adsplacesService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.adsplacesService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async update(@Res() res, @Param('id') id: string, @Body() createAdsplacesDto: CreateAdsplacesDto) {

        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {
            let data = await this.adsplacesService.update(id, createAdsplacesDto);
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
