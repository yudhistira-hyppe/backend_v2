import { Body, Controller, Delete, Get, Param, Post, UseGuards, Res, Request, HttpStatus, Put, Headers } from '@nestjs/common';
import { MediavideosadsService } from './mediavideosads.service';
import { CreateMediavodeosadsDto } from './dto/create-mediavideosads.dto';
import { Mediavideosads } from './schemas/mediavideosads.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/mediavideosads')
export class MediavideosadsController {

    constructor(private readonly mediavideosadsService: MediavideosadsService,) { }
}
