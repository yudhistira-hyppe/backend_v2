import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
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
    @Post('delete')
    async delete(@Res() res, @Req() request: Request, @Headers() headers) 
    {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var idchallenge = request_json['idChallenge'];
        var iduser = request_json['idUser'];

        if(idchallenge == null && idchallenge == undefined)
        {
            throw new BadRequestException("Unabled to proceed, challenge id field is required");
        }

        if(iduser == null && iduser == undefined)
        {
            throw new BadRequestException("Unabled to proceed, user id field is required");
        }

        await this.userChallengeSS.delete(idchallenge, iduser);

        const messages = {
            "info": ["The create successful"],
        };

        return res.status(HttpStatus.OK).json({
            response_code: 202,
            "message": messages
        });
    }
}
