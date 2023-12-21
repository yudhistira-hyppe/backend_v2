import { Body, Controller, Delete, Get, Param, Post, UseGuards, Query, BadRequestException, Req, HttpStatus, HttpCode, Headers } from '@nestjs/common';
import { GetuserprofilesService } from './getuserprofiles.service';
import { CreateGetuserprofilesDto } from './dto/create-getuserprofiles.dto';
import { Getuserprofiles } from './schemas/getuserprofiles.schema';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { CountriesService } from '../../infra/countries/countries.service';
import { CitiesService } from '../../infra/cities/cities.service';
import { UserauthsService } from '../userauths/userauths.service';
import { AreasService } from '../../infra/areas/areas.service';
import { InsightsService } from '../../content/insights/insights.service';
import { LanguagesService } from '../../infra/languages/languages.service';
import { InterestsService } from '../../infra/interests/interests.service';
import { JwtService } from '@nestjs/jwt';
import { MediaprofilepictsService } from '../../content/mediaprofilepicts/mediaprofilepicts.service';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PaginationParams } from './utils/paginationParams';
import { ActivityeventsService } from '../activityevents/activityevents.service';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';

@Controller()
export class GetuserprofilesController {

  constructor(
    private readonly getuserprofilesService: GetuserprofilesService,
    private userbasicsService: UserbasicsService,
    private countriesService: CountriesService,
    private areasService: AreasService,
    private userauthsService: UserauthsService,
    private citiesService: CitiesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private languagesService: LanguagesService,
    private interestsService: InterestsService,
    private activityeventsService: ActivityeventsService,
    private readonly utilsService: UtilsService,
    private readonly logapiSS: LogapisService

  ) { }

  @Post()
  async create(@Body() CreateGetuserprofilesDto: CreateGetuserprofilesDto) {
    await this.getuserprofilesService.create(CreateGetuserprofilesDto);
  }

  //   @UseGuards(JwtAuthGuard)
  //   @Post()
  // async getAllPosts(@Query() { skip, limit }: PaginationParams) {
  //   return this.getuserprofilesService.findAll(skip, limit);
  // }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.getuserprofilesService.delete(id);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('api/getuserhyppe')
  // @HttpCode(HttpStatus.ACCEPTED)
  // async userhyppe(
  //   @Query('skip') skip: number,
  //   @Query('limit') limit: number,
  //   @Query('search') search: string,
  //   @Query('searchemail') searchemail: string,
  //   @Query('groupId') groupId: string,
  //   @Headers() headers,
  //   @Req() req) {

  //   var timestamps_start = await this.utilsService.getDateTimeString();
  //   var fullurl = req.get("Host") + req.originalUrl;
  //   var token = headers['x-auth-token'];
  //   var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  //   var email = auth.email;

  //   console.log(skip);
  //   console.log(limit);
  //   if (search == undefined) {
  //     search = "";
  //   }
  //   if (searchemail == undefined) {
  //     searchemail = "";
  //   }
  //   if (groupId == undefined) {
  //     groupId = "";
  //   }
  //   if (skip == undefined) {
  //     skip = 0;
  //   }
  //   if (limit == undefined) {
  //     limit = 100;
  //   }
  //   var data = await this.getuserprofilesService.getUserHyppe(searchemail, search, Number(skip), Number(limit), groupId);
  //   //var totalRow = (await this.getuserprofilesService.countUserHyppe(searchemail, search)).length;

  //   var timestamps_end = await this.utilsService.getDateTimeString();
  //   this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

  //   return {
  //     response_code: 202, data: data, skip: skip, limit: limit, messages: {
  //       "info": [
  //         "successfully"
  //       ]
  //     }
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @Post('api/getuserhyppe')
  @HttpCode(HttpStatus.ACCEPTED)
  async userhyppe2(
    @Headers() headers,
    @Req() req) {

    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = req.get("Host") + req.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var request_json = JSON.parse(JSON.stringify(req.body));
    var startdate = request_json['startdate'];
    var enddate = request_json['enddate'];
    var skip = request_json['skip'];
    var limit = request_json['limit'];
    var search = request_json['search'];
    var jabatan = request_json['jabatan'];
    var divisi = request_json['divisi'];
    var groupId = request_json['groupId'];
    var ascending = request_json['ascending'];
    var status = request_json['status'];

    if(startdate == null || startdate == undefined || enddate == null || enddate == undefined)
    {
      startdate = null;
      enddate = null;
    }

    if (skip == null || skip == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, skip field is required");
    }
    if (limit == null || limit == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, limit field is required");
    }
    if (ascending == null || ascending == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed, ascending field is required");
    }
    var data = await this.getuserprofilesService.getUserHyppe2(search, startdate, enddate, jabatan, divisi, status, skip, limit, ascending);
    //var totalRow = (await this.getuserprofilesService.countUserHyppe(searchemail, search)).length;

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202, data: data, skip: skip, limit: limit, messages: {
        "info": [
          "successfully"
        ]
      }
    }
  }


  @Post('api/getuserprofiles')
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/getuserprofiles';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    
    var request_json = JSON.parse(JSON.stringify(request.body));
    var username = null;
    var gender = null;
    var startage = null;
    var endage = null;
    var jenis = null;
    var data = null;
    var page = null;
    var lokasi = null;
    var countrow = null;
    var startdate = null;
    var enddate = null;
    var startlogin = null;
    var endlogin = null;
    var limit = null;
    var datafilter = null;
    var totalfilter = 0;
    var descending = null;
    var creator = null;
    var type = null;
    const messages = {
      "info": ["The process successful"],
    };

    startage = request_json["startage"];
    endage = request_json["endage"];
    username = request_json["username"];
    gender = request_json["gender"];
    jenis = request_json["jenis"];
    lokasi = request_json["lokasi"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    startlogin = request_json["startlogin"];
    endlogin = request_json["endlogin"];
    descending = request_json["descending"];
    type = request_json["type"];
    creator = request_json["creator"];
    var allrow = 0;
    var totalallrow = 0;
    var totalrow = 0;
    var totalpage = 0;
    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    try {
      data = await this.activityeventsService.filteruser(username, gender, jenis, lokasi, startage, endage, startdate, enddate, startlogin, endlogin, page, limit, descending, type, creator);
      totalrow = data.length;
    } catch (e) {
      data = [];
      totalrow = 0;
    }

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, data, page, limit, totalrow, totalallrow, totalfilter, totalpage, messages };


  }
  @Post('api/getuserprofiles/search')
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async finduser(@Req() request: Request, @Headers() headers): Promise<any> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + '/api/getuserprofiles/search';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    
    var request_json = JSON.parse(JSON.stringify(request.body));
    var username = null;
    var skip = 0;
    var limit = 0;
    var data = null;

    const messages = {
      "info": ["The process successful"],
    };

    if (request_json["username"] !== undefined) {
      username = request_json["username"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }
    data = await this.userauthsService.findUser(username, skip, limit);

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);
    return { response_code: 202, data, skip, limit, messages };
  }

  @Post('api/getuserprofiles/ff')
  async finduserdata(): Promise<any> {
    var data = await this.getuserprofilesService.findUserDetailbyEmail("limstudio07@gmail.com");
    return data;
  }
}
