import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
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
}
