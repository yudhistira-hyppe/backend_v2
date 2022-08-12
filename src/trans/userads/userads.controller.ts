import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserAdsService } from './userads.service';
import { CreateUserAdsDto } from './dto/create-userads.dto';
import { UserAds } from './schemas/userads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import mongoose from 'mongoose';

@Controller('api/userads')
export class UserAdsController {
    constructor(private readonly userAdsService: UserAdsService) {}
    @Post('/create')
    async create(@Body() request) {
        var CreateUserAdsDto_ = new CreateUserAdsDto();
        CreateUserAdsDto_.adsID = new mongoose.Types.ObjectId('62e23e6ef63d0000510026b4');
        await this.userAdsService.createUserAds(CreateUserAdsDto_);
        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Create group module successfully"
                ]
            },
        };
    }
}
