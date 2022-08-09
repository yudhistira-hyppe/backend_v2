import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserAdsService } from './userads.service';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds } from './schemas/userads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/userads')
export class UserAdsController {

    constructor(private readonly userAdsService: UserAdsService) {}

}
