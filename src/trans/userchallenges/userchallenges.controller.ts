import { Body, Controller, Get, Param, Post, Res, UseGuards, Request, BadRequestException, HttpStatus, Req, HttpCode, Headers } from '@nestjs/common';
import { UserchallengesService } from './userchallenges.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Userchallenges } from './schemas/userchallenges.schema';
import { CreateUserChallengeDto } from './dto/create-userchallenge.dto';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import mongoose, { mongo } from 'mongoose';

@Controller('api/userchallenges')
export class UserchallengesController {
    constructor(private readonly userChallengeSS: UserchallengesService,
        private readonly utils: UtilsService,
        private readonly basicSS: UserbasicsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('delete')
    async delete(@Res() res, @Req() request: Request, @Headers() headers) {
        var request_json = JSON.parse(JSON.stringify(request.body));
        var idchallenge = request_json['idChallenge'];
        var email = request_json['email'];
        var idadmin = request_json['idAdmin'];
        var reason = request_json['reason'];

        if (idchallenge == null && idchallenge == undefined) {
            throw new BadRequestException("Unabled to proceed, challenge id field is required");
        }

        if (email == null && email == undefined) {
            throw new BadRequestException("Unabled to proceed, user id field is required");
        }

        if (idadmin == null && idadmin == undefined) {
            throw new BadRequestException("Unabled to proceed, admin id field is required");
        }

        if (reason == null && reason == undefined) {
            throw new BadRequestException("Unabled to proceed, reason field is required");
        }

        var exileUser = await this.basicSS.findOne(email);
        var admin = await this.basicSS.findbyid(idadmin);

        var getuserchallenge = await this.userChallengeSS.findByChallengeandUser(idchallenge, exileUser._id.toString());

        if (getuserchallenge.length != 0) {
            var insertid = [];
            var getarray = getuserchallenge[0].rejectRemark;
            if (getarray == null || getarray == undefined) {
                getarray = [];
            }
            var insertreject = {};
            insertreject['idAdmin'] = idadmin;
            insertreject['time'] = await this.utils.getDateTimeString();
            insertreject['emailAdmin'] = admin.email;
            insertreject['remark'] = reason;
            getarray.push(insertreject);

            var updatedata = new Userchallenges();
            updatedata.isActive = false;
            updatedata.rejectRemark = getarray;
            updatedata.updatedAt = await this.utils.getDateTimeString();

            for (var i = 0; i < getuserchallenge.length; i++) {
                insertid.push(getuserchallenge[i]._id.toString());
            }

            try {
                await this.userChallengeSS.delete(insertid, exileUser._id.toString(), updatedata);

                const messages = {
                    "info": ["The create successful"],
                };

                res.status(HttpStatus.OK).json({
                    response_code: 202,
                    "message": messages
                });
            }
            catch (e) {
                console.log(e);
            }
        }
    }
}
