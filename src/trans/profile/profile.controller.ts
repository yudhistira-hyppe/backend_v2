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
    var countries = null;
    var countries_json = null;
    var countri = null;
    var cities_json = null;
    var cities = null;
    var citi = null;
    var mediaprofilepicts_json = null;
    var mediaprofilepicts = null;
    var mediaprofilepicts_res = null;
    var areas = null;
    var insights_json = null;
    var insights_res = null;

    if (request_json["email"] !== undefined) {
      emails = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }


    const datauserauthsService = await this.userauthsService.findOne(emails);
    const datauserbasicsService = await this.userbasicsService.findOne(emails);


    var languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));

    var interest_json = JSON.parse(JSON.stringify(datauserbasicsService.userInterests));
    try {
      insights_json = JSON.parse(JSON.stringify(datauserbasicsService.insight));
      var insights = await this.insightsService.findOne(insights_json.$id);
      insights_res = {
        shares: insights.shares,
        followers: insights.followers,
        comments: insights.comments,
        followings: insights.followings,
        reactions: insights.reactions,
        posts: insights.posts,
        views: insights.views,
        likes: insights.likes
      };
    } catch (e) {
      insights_res = {
        shares: 0,
        followers: 0,
        comments: 0,
        followings: 0,
        reactions: 0,
        posts: 0,
        views: 0,
        likes: 0
      };
    }
    try {
      countries_json = JSON.parse(JSON.stringify(datauserbasicsService.countries));
      countries = await this.countriesService.findOne(countries_json.$id);
      areas = await this.areasService.findOne(countries.countryID);
      countri = countries.country;
    } catch (e) {
      countri = "";
      areas = "";
    }

    try {
      cities_json = JSON.parse(JSON.stringify(datauserbasicsService.cities));
      cities = await this.citiesService.findOne(cities_json.$id);
      citi = cities.cityName;
    } catch (e) {
      citi = "";
    }




    const languages = await this.languagesService.findOne(languages_json.$id);
    const interests = await this.interestsService.findOne(interest_json.$id);



    try {

      mediaprofilepicts_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
      mediaprofilepicts = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
      var mediaUri = mediaprofilepicts.mediaUri;
      let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
      mediaprofilepicts_res = {
        mediaBasePath: mediaprofilepicts.mediaBasePath,
        mediaUri: mediaprofilepicts.mediaUri,
        mediaType: mediaprofilepicts.mediaType,
        mediaEndpoint: result
      };
    } catch (e) {
      mediaprofilepicts_res = {
        mediaBasePath: "",
        mediaUri: "",
        mediaType: "",
        mediaEndpoint: ""
      };
    }

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
      "areas": areas,
      "country": countri,
      "gender": datauserbasicsService.gender,
      "idProofNumber": datauserbasicsService.idProofNumber,
      "city": citi,
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

