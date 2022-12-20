import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Headers } from '@nestjs/common';
import { MediapictsService } from './mediapicts.service';
import { CreateMediapictsDto } from './dto/create-mediapicts.dto';
import { Mediapicts } from './schemas/mediapicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { MediadiariesService } from '../mediadiaries/mediadiaries.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { MediastoriesService } from '../mediastories/mediastories.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Request } from 'express';
@Controller()
export class MediapictsController {
  constructor(private readonly MediapictsService: MediapictsService, private readonly MediadiariesService: MediadiariesService, private readonly MediavideosService: MediavideosService,
    private readonly MediastoriesService: MediastoriesService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler) { }

  @Post()
  async create(@Body() CreateMediapictsDto: CreateMediapictsDto) {
    await this.MediapictsService.create(CreateMediapictsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Mediapicts[]> {
    return this.MediapictsService.findAll();
  }
  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Mediapicts> {
    return this.MediapictsService.findOne(id);
  }


  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.MediapictsService.delete(id);
  }

  @Post('api/getaktifitas')
  @UseGuards(JwtAuthGuard)
  async aktifitas(@Req() request: Request, @Headers() headers): Promise<any> {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email is required',
      );
    }

    var user_email_header = headers['x-auth-user'];
    
    await this.errorHandler.generateNotAcceptableException(
      'Unabled to proceed, user permission cannot acces module',
    );

    var date = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    var hyppepict = await this.MediapictsService.findtotalpostmediapict(date);
    var hyppevid = await this.MediavideosService.findtotalpostmediavid(date);
    var hyppediaries = await this.MediadiariesService.findtotalpostmediadiaries(date);
    var hyppestories = await this.MediastoriesService.findtotalpostmediastories(date);

    var data = { hyppepict, hyppevid, hyppediaries, hyppestories };
    return { response_code: 202, data, messages };
  }

}
