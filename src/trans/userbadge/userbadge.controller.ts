import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode } from '@nestjs/common';
import { UserbadgeService } from './userbadge.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userbadge } from './schemas/userbadge.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose, { mongo } from 'mongoose';


@Controller('api/userbadge')
export class UserbadgeController {

    constructor(private readonly userbadgeService: UserbadgeService,
        private readonly utils: UtilsService) { }

}
