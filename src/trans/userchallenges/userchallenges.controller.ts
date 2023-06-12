import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode } from '@nestjs/common';
import { UserchallengesService } from './userchallenges.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userchallenges } from './schemas/userchallenges.schema';
import { CreateUserChallengeDto } from './dto/create-userchallenge.dto';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import mongoose, { mongo } from 'mongoose';

@Controller('api/userchallenges')
export class UserchallengesController {
    constructor(private readonly userChallengeSS: UserchallengesService,
        private readonly utils: UtilsService) {}

}
