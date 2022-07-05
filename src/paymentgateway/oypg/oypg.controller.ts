import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { OyPgService } from './oypg.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OyDisburseCallback } from './dto/OyDisburseCallback';

@Controller('api/pg/oy')
export class OyPgController {
    constructor(private readonly oyPgService:OyPgService) { }

    @Post()
    async create(@Body() payload: OyDisburseCallback) {

        console.log(payload);
    }
    
}
