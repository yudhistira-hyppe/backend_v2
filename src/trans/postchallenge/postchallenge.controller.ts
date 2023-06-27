import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode } from '@nestjs/common';
import { PostchallengeService } from './postchallenge.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Postchallenge } from './schemas/postchallenge.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose, { mongo } from 'mongoose';

@Controller('api/postchallenge')
export class PostchallengeController {
    constructor(private readonly postchallengeService: PostchallengeService,
        private readonly utils: UtilsService) { }

}
