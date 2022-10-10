import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Req, Request, Query, Headers, HttpCode } from '@nestjs/common';
import { UserbasicsnewService } from './userbasicsnew.service';
import { CreateUserbasicnewDto } from './dto/create-userbasicnew.dto';
import { Userbasic } from './schemas/userbasicnew.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response } from '@nestjs/common';
import { isEmpty } from 'rxjs';

@Controller('api/userbasics')
export class UserbasicsnewController {
  constructor(private readonly userbasicsnewService: UserbasicsnewService) { }
}