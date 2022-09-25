import { Body, Controller, Delete, Get, Param, Post, UseGuards, Query, BadRequestException, Req, HttpStatus, HttpCode } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get('api/getuserhyppe')
  @HttpCode(HttpStatus.ACCEPTED)
  async userhyppe(
    @Query('skip') skip: number,
    @Query('limit') limit: number,
    @Query('search') search: string,
    @Query('searchemail') searchemail: string,
    @Query('groupId') groupId: string) {
    console.log(skip);
    console.log(limit);
    if (search == undefined) {
      search = "";
    }
    if (searchemail == undefined) {
      searchemail = "";
    }
    if (groupId == undefined) {
      groupId = "";
    }
    if (skip == undefined) {
      skip = 0;
    }
    if (limit == undefined) {
      limit = 100;
    }
    var data = await this.getuserprofilesService.getUserHyppe(searchemail, search, Number(skip), Number(limit), groupId);
    var totalRow = (await this.getuserprofilesService.countUserHyppe(searchemail, search)).length;
    return {
      response_code: 202, data: data, totalRow: totalRow, skip: skip, limit: limit, messages: {}
    }
  }


  @Post('api/getuserprofiles')
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));
    var username = null;
    var gender = null;
    var age = null;
    var roles = null;
    var data = null;
    var skip = null;
    var interest = null;
    var countrow = null;
    var startdate = null;
    var enddate = null;
    var limit = null;
    var datafilter = null;
    var totalfilter = null;
    const messages = {
      "info": ["The process successful"],
    };

    age = request_json["age"];
    username = request_json["username"];
    gender = request_json["gender"];
    roles = request_json["roles"];
    interest = request_json["interest"];
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];
    var allrow = null;
    var totalallrow = null;
    var totalrow = null;
    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    try {
      data = await this.getuserprofilesService.findataNew(username, gender, roles, age, startdate, enddate, interest, skip, limit);
      totalrow = data.length;
    } catch (e) {
      data = [];
      totalrow = 0;
    }
    try {
      datafilter = await this.getuserprofilesService.findataNewCount(username, gender, roles, age, startdate, enddate, interest, 0, 50);
      totalfilter = datafilter.length;
    } catch (e) {
      totalfilter = 0;
    }

    try {
      allrow = await this.getuserprofilesService.totalcount();
      totalallrow = allrow[0].countrow;
    } catch (e) {
      totalallrow = 0;
    }

    return { response_code: 202, data, skip, limit, totalrow, totalfilter, totalallrow, messages };

  }

  @Post('api/getuserprofiles/search')
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async finduser(@Req() request: Request): Promise<any> {
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
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["skip"] !== undefined) {
      skip = request_json["skip"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["limit"] !== undefined) {
      limit = request_json["limit"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    data = await this.getuserprofilesService.findUser(username, skip, limit);
    return { response_code: 202, data, skip, limit, messages };
  }


}
