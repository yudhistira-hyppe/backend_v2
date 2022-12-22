import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DeepArService } from './deepar.service';
import { DeepArDto } from './dto/create-deepar.dto';
import { DeepAr } from './schemas/deepar.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/settings')
export class DeepArController {
    constructor(private readonly deepArService: DeepArService) { }
}
