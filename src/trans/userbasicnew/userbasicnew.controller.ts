import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { UserbasicnewService } from './userbasicnew.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userbasicnew } from './schemas/userbasicnew.schema';

@Controller('api/userbasicnew')
export class UserbasicnewController {
    constructor(
        private readonly UserbasicnewService: UserbasicnewService,

    ) { }
}
