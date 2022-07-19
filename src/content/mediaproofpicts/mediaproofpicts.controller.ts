import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Request, BadRequestException, Res } from '@nestjs/common';
import { MediaproofpictsService } from './mediaproofpicts.service';
import { CreateMediaproofpictsDto } from './dto/create-mediaproofpicts.dto';
import { Mediaproofpicts } from './schemas/mediaproofpicts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';


@Controller('api/mediaproofpicts')
export class MediaproofpictsController {
  constructor(private readonly MediaproofpictsService: MediaproofpictsService) { }

  // @Post()
  // async create(@Body() CreateMediaproofpictsDto: CreateMediaproofpictsDto) {
  //   await this.MediaproofpictsService.create(CreateMediaproofpictsDto);
  // }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Mediaproofpicts[]> {
    return this.MediaproofpictsService.findAll();
  }
  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Mediaproofpicts> {
    return this.MediaproofpictsService.findOne(id);
  }


  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.MediaproofpictsService.delete(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @FormDataRequest()
  async upload(@Res() res, @Headers('x-auth-token') auth: string, @Request() request) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var files = null;
    if (request_json["files"] !== undefined) {
      files = request_json["files"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    var filename = files.originalName;
    var weedClient = require("node-seaweedfs");

    var seaweedfs = new weedClient({
      server: "172.16.0.4",
      port: 19555,
      protocol: "https",
    });

    seaweedfs.write("./" + filename).then(function (fileInfo) {
      return seaweedfs.read(fileInfo.fid);
    }).then(function (Buffer) {
      throw new BadRequestException(Buffer);
    }).catch(function (err) {
      throw new BadRequestException(err);
    });
  }
}
