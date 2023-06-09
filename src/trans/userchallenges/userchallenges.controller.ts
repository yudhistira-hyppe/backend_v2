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

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Res() res, @Req() request: Request) {
        
        var request_json = JSON.parse(JSON.stringify(request.body));

        var createdata = new Userchallenges();
        var mongo = require('mongoose');
        createdata._id = mongo.Types.ObjectId();
        createdata.idChallenge = new mongo.Types.ObjectId(request_json['idChallenge']);
        createdata.idUser = new mongo.Types.ObjectId(request_json['idUser']);
        createdata.isActive = true;
        createdata.ranking = 0;
        createdata.score = 0;
        createdata.createdAt = await this.utils.getDateTimeString();
        createdata.updatedAt = await this.utils.getDateTimeString();
        createdata.activity = [];
        createdata.history = [];
        
        const messages = {
            "info": ["The create successful"],
        };

        const messagesEror = {
            "info": ["Todo is not found!"],
        };

        await this.userChallengeSS.create(createdata);
        return res.status(HttpStatus.OK).json({
            response_code: 202,
            "data": createdata,
            "message": messages
        });
    }
}
