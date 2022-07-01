import { Controller, Post, Get, BadRequestException, Req, Body, UseGuards } from '@nestjs/common';
import { FileSystemStoredFile, FormDataRequest } from 'nestjs-form-data';
import { ProfileService } from './profile.service';
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
@Controller('api/profile')
export class ProfileController {
  constructor(
    private userbasicsService: UserbasicsService,
    private countriesService: CountriesService,
    private areasService: AreasService,
    private userauthsService: UserauthsService,
    private citiesService: CitiesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private languagesService: LanguagesService,
    private interestsService: InterestsService,
  ) { }


  @Post()
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async profileuser(@Req() request: Request): Promise<any> {
    var request_json = JSON.parse(JSON.stringify(request.body));

    var emails = null;
    var interest = [];

    if (request_json["email"] !== undefined) {
      emails = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }


    const datauserauthsService = await this.userauthsService.findOne(emails);
    const datauserbasicsService = await this.userbasicsService.findOne(emails);
    var countries_json = JSON.parse(JSON.stringify(datauserbasicsService.countries));
    var cities_json = JSON.parse(JSON.stringify(datauserbasicsService.cities));
    var languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
    var mediaprofilepicts_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
    var insights_json = JSON.parse(JSON.stringify(datauserbasicsService.insight));
    var interest_json = JSON.parse(JSON.stringify(datauserbasicsService.userInterests));
    const countries = await this.countriesService.findOne(countries_json.$id);
    const cities = await this.citiesService.findOne(cities_json.$id);
    const mediaprofilepicts = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
    const areas = await this.areasService.findOne(countries.countryID);
    const insights = await this.insightsService.findOne(insights_json.$id);
    const languages = await this.languagesService.findOne(languages_json.$id);
    const interests = await this.interestsService.findOne(interest_json.$id);
    var mediaUri = mediaprofilepicts.mediaUri;

    let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
    var mediaprofilepicts_res = {
      mediaBasePath: mediaprofilepicts.mediaBasePath,
      mediaUri: mediaprofilepicts.mediaUri,
      mediaType: mediaprofilepicts.mediaType,
      mediaEndpoint: result
    };
    var insights_res = {
      shares: insights.shares,
      followers: insights.followers,
      comments: insights.comments,
      followings: insights.followings,
      reactions: insights.reactions,
      posts: insights.posts,
      views: insights.views,
      likes: insights.likes
    };

    try {
      interest = [{
        interestName: interests.interestName,
        icon: interests.icon,
        createdAt: interests.createdAt,
        updatedAt: interests.updatedAt,
        _class: interests._class,
      }];
    } catch (err) {
      interest = [];
    }
    const messages = {
      "info": ["The process successful"],
    };

    const data = [{
      "createdAt": datauserbasicsService.createdAt,
      "areas": areas.stateName,
      "country": countries.country,
      "gender": datauserbasicsService.gender,
      "idProofNumber": datauserbasicsService.idProofNumber,
      "city": cities.cityName,
      "mobileNumber": datauserbasicsService.mobileNumber,
      "roles": datauserauthsService.roles,
      "fullName": datauserbasicsService.fullName,
      "bio": datauserbasicsService.bio,
      "avatar": mediaprofilepicts_res,
      "isIdVerified": datauserbasicsService.isIdVerified,
      "isEmailVerified": datauserauthsService.isEmailVerified,
      "idProofStatus": datauserbasicsService.idProofStatus,
      "insight": insights_res,
      "langIso": languages.langIso,
      "interest": interest,
      "dob": datauserbasicsService.dob,
      "event": datauserbasicsService.event,
      "email": datauserbasicsService.email,
      "username": datauserauthsService.username,
      "isComplete": datauserbasicsService.isComplete,
      "status": datauserbasicsService.status,
    }];

    return {
      response_code: 202,
      data,
      messages
    };
  }
}

