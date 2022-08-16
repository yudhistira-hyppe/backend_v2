import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers } from '@nestjs/common';
import { MediaimageadsService } from './mediaimageads.service';
import { CreateMediaimageadsDto } from './dto/create-mediaimageads.dto';
import { Mediaimageads } from './schemas/mediaimageads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';


@Controller('api/mediaimageads')
export class MediaimageadsController {

    constructor(private readonly mediaimageadsService: MediaimageadsService,) { }
}
