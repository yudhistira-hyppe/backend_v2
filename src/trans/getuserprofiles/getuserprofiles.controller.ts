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
    var fullName = null;
    var gender = null;
    var age = null;
    var roles = null;
    var data = null;
    var page = null;
    var countrow = null;

    const messages = {
      "info": ["The process successful"],
    };

    age = request_json["age"];
    fullName = request_json["fullName"];
    gender = request_json["gender"];
    roles = request_json["roles"];


    if (request_json["page"] !== undefined) {
      page = request_json["page"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }


    data = await this.getuserprofilesService.findata(fullName, gender, roles, age, page);

    var allrow = await this.getuserprofilesService.totalcount();
    var totalallrow = allrow[0].countrow;
    var totalrow = data.length;
    return { response_code: 202, data, page, totalrow, totalallrow, messages };
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
