import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, HttpStatus, HttpCode } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/jwt-auth.guard';
import { PostDisqusService } from './postdisqus.service';
import { Posts } from '../../posts/schemas/posts.schema';

@Controller('api/')
export class PostDisqusController {

  constructor(private readonly postDisqusService: PostDisqusService,) { }
}
