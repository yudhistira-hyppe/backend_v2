import { Body, Controller, Delete, Get, Param, Post, UseGuards, Query, BadRequestException, Req } from '@nestjs/common';
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
    var skip = null;
    var limit = null;

    const messages = {
      "info": ["The process successful"],
    };

    age = request_json["age"];
    fullName = request_json["fullName"];
    gender = request_json["gender"];
    roles = request_json["roles"];
    skip = request_json["skip"];
    limit = request_json["limit"];

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

    data = await this.getuserprofilesService.findata(fullName, gender, roles, age, skip, limit);

    return { response_code: 202, data, messages };
  }


}
