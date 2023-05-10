import { Body, Controller, Delete, Get, Param, Post, Put, Res, Request, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings } from './schemas/settings.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Settings> {
        return this.settingsService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Settings[]> {
        return this.settingsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Body() CreateSettingsDto: CreateSettingsDto) {
        const messages = {
            "info": ["The process successful"],
        };
        var data = await this.settingsService.create(CreateSettingsDto);
        return { response_code: 202, data, messages };
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.settingsService.delete(id);
    }
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updateid(@Res() res, @Param('id') id: string, @Body() CreateSettingsDto: CreateSettingsDto, @Request() request) {
        const messages = {
            "info": ["The update successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        try {


            let data = await this.settingsService.update(id, CreateSettingsDto);
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


    @Post('/list')
    @UseGuards(JwtAuthGuard)
    async profileuser(@Req() request: Request): Promise<any> {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var jenis = null;
        var data = null;
        const messages = {
            "info": ["The process successful"],
        };

        jenis = request_json["jenis"];

        try {
            data = await this.settingsService.list(jenis);

        } catch (e) {
            data = [];

        }
        return { response_code: 202, data, messages };


    }

}
