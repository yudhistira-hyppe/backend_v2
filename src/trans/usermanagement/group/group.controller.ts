import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Query, Post, UseGuards, Param, Request, Headers, Req, Head, Header } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupDto } from './dto/group.dto';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { Group } from './schemas/group.schema';
import { UtilsService } from '../../../utils/utils.service';
import { ErrorHandler } from '../../../utils/error.handler';
import { UserbasicsService } from '../../../trans/userbasics/userbasics.service';
import { DivisionService } from '../division/division.service';
import { UserauthsService } from '../../../trans/userauths/userauths.service';
import { ObjectId } from 'mongodb';
import mongoose, { Schema } from 'mongoose';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { request } from 'http';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { CreateuserbasicnewDto } from 'src/trans/userbasicnew/dto/Createuserbasicnew-dto';

@Controller('/api/group')
export class GroupController {

    constructor(
        private readonly groupService: GroupService,
        private readonly utilsService: UtilsService,
        private readonly errorHandler: ErrorHandler,
        private readonly userbasicsService: UserbasicsService,
        private readonly divisionService: DivisionService,
        private readonly userauthsService: UserauthsService,
        private readonly logapiSS: LogapisService,
        private readonly basic2SS: UserbasicnewService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/create')
    async create(@Body() request, @Headers() headers) {
        var fullurl = headers.host + '/api/group/create';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request));

        var current_date = await this.utilsService.getDateTimeString();
        var data_group = null;
        var data_division = null;
        var insert = false;
        var data_user_insert = [];
        var data_user_insert_email = [];
        var data_user_not_insert = [];
        var data_user_not_found = [];

        if (request.nameGroup == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, current_date, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        } else {
            data_group = await this.groupService.findOnebyName(request.nameGroup);
            if (!(await this.utilsService.ceckData(data_group))) {
                insert = true
            }
        }

        if (request.divisionId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, current_date, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param divisionId is required',
            );
        } else {
            data_division = await this.divisionService.findOne(request.divisionId);
            if (!(await this.utilsService.ceckData(data_division))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, current_date, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create group param divisionId is not found',
                );
            }
        }

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        GroupDto_.divisionId = Object(request.divisionId);
        if (request.userbasics != undefined) {
            if (request.userbasics.length > 0) {
                for (var i = 0; i < request.userbasics.length; i++) {
                    var data_userbasic = await this.userbasicsService.findOne(request.userbasics[i]);
                    if (await this.utilsService.ceckData(data_userbasic)) {
                        var data_user_group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(data_userbasic._id.toString()));
                        if (await this.utilsService.ceckData(data_user_group)) {
                            if (data_user_group[0].nameGroup == request.nameGroup) {
                                data_user_insert.push(new Object(data_userbasic._id.toString()));
                                data_user_insert_email.push(request.userbasics[i]);
                            } else {
                                data_user_not_insert.push(request.userbasics[i]);
                            }
                        } else {
                            data_user_insert.push(new Object(data_userbasic._id.toString()));
                            data_user_insert_email.push(request.userbasics[i]);
                        }
                    } else {
                        data_user_not_found.push(request.userbasics[i]);
                    }
                }
                GroupDto_.userbasics = data_user_insert;
            }
        }
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        GroupDto_.updateAt = current_date;
        if (insert) {
            GroupDto_.createAt = current_date;
            await this.groupService.create(GroupDto_);
        } else {
            await this.groupService.update(data_group._id, GroupDto_);
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, current_date, timestamps_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "data": {
                "nameGroup": request.nameGroup,
                "data_usert_insert_in_group": data_user_insert_email,
                "user_exist_in_another_group": data_user_not_insert,
                "user_not_found": data_user_not_found
            },
            "messages": {
                "info": [
                    "Create group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/all')
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('search') search: string,
        @Request() request,
        @Headers() headers) {

        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        if (search == undefined) {
            search = "";
        }
        var data = await this.groupService.findAll(search, skip, limit);
        var totalRow = (await this.groupService.findAllCount(search)).length;

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return {
            "response_code": 202,
            "totalRow": totalRow,
            "data": data,
            skip: skip,
            limit: limit,
            "messages": {
                "info": [
                    "Get list group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/:id')
    async getByid(@Param('id') id: string, @Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data = await this.groupService.findByid(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return {
            "response_code": 202,
            "data": data,
            "messages": {
                "info": [
                    "Get group successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/update')
    async update(@Body() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/group/update';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request));

        var current_date = await this.utilsService.getDateTimeString();
        var data_division = null;
        var data_user_insert = [];
        var data_user_insert_email = [];
        var data_user_not_insert = [];
        var data_user_not_found = [];

        if (request._id == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param _id is required',
            );
        }
        if (request.nameGroup == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param nameGroup is required',
            );
        }

        if (request.divisionId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Create group param divisionId is required',
            );
        } else {
            data_division = await this.divisionService.findOne(request.divisionId);
            if (!(await this.utilsService.ceckData(data_division))) {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed Create group param divisionId is not found',
                );
            }
        }

        var GroupDto_ = new GroupDto();
        GroupDto_.nameGroup = request.nameGroup;
        GroupDto_.divisionId = Object(request.divisionId);
        GroupDto_.updateAt = current_date;
        if (request.desc != undefined) {
            GroupDto_.desc = request.desc;
        }
        await this.groupService.update(request._id, GroupDto_);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        return {
            "response_code": 202,
            "data": {
                "nameGroup": request.nameGroup,
                "data_usert_insert_in_group": data_user_insert_email,
                "user_exist_in_another_group": data_user_not_insert,
                "user_not_found": data_user_not_found
            },
            "messages": {
                "info": [
                    "Update group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/delete')
    async delete(
        @Query('id') id: string,
        @Request() request,
        @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;

        var data_ceck = await this.groupService.findOne(id);
        if (await this.utilsService.ceckData(data_ceck)){
            if (data_ceck.userbasics.length > 0) {
                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed delete group user, group is use',
                );
            }
        }
        await this.groupService.delete(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Delete group user successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/user')
    async addusergroup(@Body() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/group/user';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request));

        if (request.email == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param email is required',
            );
        }
        if (request.groupId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param groupId is required',
            );
        }

        var data_userbasic = await this.userbasicsService.findOne(request.email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(data_userbasic._id.toString()));
            var user_auth = await this.userauthsService.findOneemail(request.email);
            if (await this.utilsService.ceckData(user_auth)) {
                if (await this.utilsService.ceckData(group)) {
                    console.log(group._id.toString());
                    if (group._id.toString() != request.groupId) {
                        await this.groupService.deleteUserGroup(group._id, new mongoose.Types.ObjectId(data_userbasic._id.toString()));
                        await this.groupService.addUserGroup(request.groupId, new mongoose.Types.ObjectId(data_userbasic._id.toString()));

                        var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                        if (!(await this.utilsService.ceckData(user_auth_role))) {
                            await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                        }
                    } else {
                        var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                        if (!(await this.utilsService.ceckData(user_auth_role))) {
                            await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                        }
                    }
                } else {
                    await this.groupService.addUserGroup(request.groupId, new mongoose.Types.ObjectId(data_userbasic._id.toString()));

                    var user_auth_role = await this.userauthsService.findRoleEmail(request.email, "ROLE_ADMIN");
                    if (!(await this.utilsService.ceckData(user_auth_role))) {
                        await this.userauthsService.addUserRole(request.email, "ROLE_ADMIN");
                    }
                }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Update user to group successfully"
                        ]
                    },
                };
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed userauth not found',
                );
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Post('/user/v2')
    async addusergroup2(@Body() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = headers.host + '/api/group/user/v2';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email;
        var reqbody = JSON.parse(JSON.stringify(request));

        if (request.email == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param email is required',
            );
        }
        if (request.groupId == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param groupId is required',
            );
        }

        var data_userbasic = await this.basic2SS.findbyemail(request.email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(data_userbasic._id.toString()));
            
            if (await this.utilsService.ceckData(group)) {
                console.log(group._id.toString());
                if (group._id.toString() != request.groupId) {
                    await this.groupService.deleteUserGroup(group._id, new mongoose.Types.ObjectId(data_userbasic._id.toString()));
                    await this.groupService.addUserGroup(request.groupId, new mongoose.Types.ObjectId(data_userbasic._id.toString()));
                }
            } else {
                await this.groupService.addUserGroup(request.groupId, new mongoose.Types.ObjectId(data_userbasic._id.toString()));
            }

            var updatedata = new CreateuserbasicnewDto();
            var temparray = data_userbasic.roles;
            var cekadmin = false;
            try
            {
                var getrole = temparray.find((element) => element == "ROLE_ADMIN");
                if(getrole != null && getrole != undefined)
                {
                    cekadmin = true;
                }
            }
            catch(e)
            {
                cekadmin = false;
            }

            if(cekadmin == false)
            {
                temparray.push("ROLE_ADMIN");
                updatedata.roles = temparray;
                await this.basic2SS.update(data_userbasic._id.toString(), updatedata);
            }

            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return {
                "response_code": 202,
                "messages": {
                    "info": [
                        "Update user to group successfully"
                    ]
                },
            };
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Delete('/user')
    async deleteusergroup(
        @Query('email') email: string, @Request() request, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = auth.email;

        if (email == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed Add user to group param email is required',
            );
        }

        var data_userbasic = await this.userbasicsService.findOne(email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var group = await this.groupService.findbyuser(new mongoose.Types.ObjectId(data_userbasic._id.toString()));
            var user_auth = await this.userauthsService.findOneemail(email);
            if (await this.utilsService.ceckData(user_auth)) {
                if (await this.utilsService.ceckData(group)) {
                    await this.groupService.deleteUserGroup(group[0]._id, new mongoose.Types.ObjectId(data_userbasic._id.toString()));
                }

                var user_auth_role = await this.userauthsService.findRoleEmail(email, "ROLE_ADMIN");
                if (await this.utilsService.ceckData(user_auth_role)) {
                    await this.userauthsService.deleteUserRole(email, "ROLE_ADMIN");
                }

                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

                return {
                    "response_code": 202,
                    "messages": {
                        "info": [
                            "Delete user to group successfully"
                        ]
                    },
                };
            } else {
                var timestamps_end = await this.utilsService.getDateTimeString();
                this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

                await this.errorHandler.generateNotAcceptableException(
                    'Unabled to proceed userauth not found',
                );
            }
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('statususer')
    @HttpCode(HttpStatus.ACCEPTED)
    async updatestatususer(@Request() req, @Headers('x-auth-token') auth: string, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = setauth.email;
        var reqbody = JSON.parse(JSON.stringify(req.body));
        
        if (req.body.email == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param email is required',
            );
        }
        if (req.body.status == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param status is required',
            );
        }

        if (req.body.status){
            var user_auth_role = await this.userauthsService.findRoleEmail(req.body.email, "ROLE_ADMIN");
            if (!(await this.utilsService.ceckData(user_auth_role))) {
                await this.userauthsService.addUserRole(req.body.email, "ROLE_ADMIN");
            }
        }else{
            await this.userauthsService.deleteUserRole(req.body.email, 'ROLE_ADMIN')
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update user to successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('statususer/v2')
    @HttpCode(HttpStatus.ACCEPTED)
    async updatestatususer2(@Request() req, @Headers('x-auth-token') auth: string, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = setauth.email;
        var reqbody = JSON.parse(JSON.stringify(req.body));
        
        if (req.body.email == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param email is required',
            );
        }
        if (req.body.status == undefined) {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed param status is required',
            );
        }

        var data_userbasic = await this.basic2SS.findbyemail(req.body.email);
        if (await this.utilsService.ceckData(data_userbasic)) {
            var updatedata = new CreateuserbasicnewDto();
            var temparray = data_userbasic.roles;
            var cekadmin = false;
            try
            {
                var getrole = temparray.find((element) => element == "ROLE_ADMIN");
                if(getrole != null && getrole != undefined)
                {
                    cekadmin = true;
                }
            }
            catch(e)
            {
                cekadmin = false;
            }

            if(req.body.status == true)
            {
                if(cekadmin == false)
                {
                    temparray.push("ROLE_ADMIN");
                }
            }
            else
            {
                if(cekadmin == true)
                {
                    temparray = temparray.filter((element) => element != "ROLE_ADMIN");
                }   
            }

            updatedata.roles = temparray;
            await this.basic2SS.update(data_userbasic._id.toString(), updatedata);
        } else {
            var timestamps_end = await this.utilsService.getDateTimeString();
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

            await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed user not found',
            );
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, reqbody);

        return {
            "response_code": 202,
            "messages": {
                "info": [
                    "Update user to successfully"
                ]
            },
        };
    }


    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get()
    async getListUserGroup(@Req() req, @Headers() headers) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = setauth.email;
        
        var data = await this.groupService.listGroupUserAll();

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

        return {
            "response_code": 202,
            "data": data,
            "messages": {
                "info": [
                    "Get group successfully"
                ]
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @Get('/division/:id')
    async getGroupByIdDivisi(@Param('id') id: string, @Headers() headers, @Req() req) {
        var timestamps_start = await this.utilsService.getDateTimeString();
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var setauth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var setemail = setauth.email;

        var data = await this.groupService.findByDvivision(id);

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, setemail, null, null, null);

        return {
            "response_code": 202,
            "data": data,
            "messages": {
                "info": [
                    "Get group successfully"
                ]
            },
        };
    }
}
