import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MethodepaymentsService } from './methodepayments.service';
import { CreateMethodepaymentsDto } from './dto/create-methodepayments.dto';
import { Methodepayments } from './schemas/methodepayments.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/methodepayments')
export class MethodepaymentsController {

    constructor(private readonly methodepaymentsService: MethodepaymentsService) { }
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(): Promise<Methodepayments[]> {
        return this.methodepaymentsService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Methodepayments> {
        return this.methodepaymentsService.findOne(id);
    }
}
