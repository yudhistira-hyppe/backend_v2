import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode } from '@nestjs/common';
import { UserchallengesService } from './userchallenges.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userchallenges } from './schemas/userchallenges.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';

@Controller('userchallenges')
export class UserchallengesController {


}
