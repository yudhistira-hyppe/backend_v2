import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks } from './schemas/banks.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/banks')
export class BanksController {
    constructor(private readonly banksService: BanksService) { }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Banks> {
        return this.banksService.findOne(id);
    }
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Banks[]> {
        return this.banksService.findAll();
    }

}
