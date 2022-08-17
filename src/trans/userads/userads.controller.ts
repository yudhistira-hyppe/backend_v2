import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserAdsService } from './userads.service';

@Controller('api/userads')
export class UserAdsController {
    constructor(private readonly userAdsService: UserAdsService) {}
}
