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
import { GroupService } from '../usermanagement/group/group.service';
import { DivisionService } from '../usermanagement/division/division.service';
import { ProfileDTO } from '../../utils/data/Profile';
import { UtilsService } from '../../utils/utils.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
import { UserbankaccountsService } from '../userbankaccounts/userbankaccounts.service';
import { UserbasicnewService } from '../userbasicnew/userbasicnew.service';
import mongoose from 'mongoose';

@Controller('api/profile')
export class ProfileController {
  constructor(
    private userbasicsService: UserbasicsService,
    private basic2SS: UserbasicnewService,
    private countriesService: CountriesService,
    private areasService: AreasService,
    private userauthsService: UserauthsService,
    private citiesService: CitiesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private languagesService: LanguagesService,
    private interestsService: InterestsService,
    private groupService: GroupService,
    private divisionService: DivisionService,
    private utilsService: UtilsService,
    private userbankaccountsService: UserbankaccountsService,
    private contenteventsService: ContenteventsService,
  ) { }


  // @Post()
  // @UseGuards(JwtAuthGuard)
  // async profileuser(@Req() request: Request): Promise<any> {


  //   var request_json = JSON.parse(JSON.stringify(request.body));

  //   var emails = null;
  //   var interest = [];
  //   var countries = null;
  //   var countries_json = null;
  //   var countri = null;
  //   var cities_json = null;
  //   var cities = null;
  //   var citi = null;
  //   var mediaprofilepicts_json = null;
  //   var mediaprofilepicts = null;
  //   var mediaprofilepicts_res = null;
  //   var areas = null;
  //   var insights_json = null;
  //   var insights_res = null;

  //   var datauserbasicsService = null;
  //   var ProfileDTO_ = new ProfileDTO();
  //   if (request_json["email"] !== undefined) {
  //     emails = request_json["email"];
  //     datauserbasicsService = await this.userbasicsService.findOne(emails);
  //     ProfileDTO_ = await this.utilsService.generateProfile(emails, 'LOGIN');
  //   } else {
  //     throw new BadRequestException("Unabled to proceed");
  //   }
  //   var datagroup = {};
  //   var datadivision = {};

  //   var group = await this.groupService.findbyuser(datauserbasicsService._id.toString());
  //   if (group.length>0){
  //     datagroup = {
  //         _id: group[0]._id,
  //         nameGroup: group[0].nameGroup,
  //       }
  //     var division = await this.divisionService.findOne(group[0].divisionId.toString());
  //     if (division.nameDivision !=undefined) {
  //       datadivision = {
  //         _id: division._id,
  //         nameDivision: division.nameDivision,
  //       }
  //     }
  //   }
  //   ProfileDTO_.group = datagroup;
  //   ProfileDTO_.division = datadivision;

  //   const messages = {
  //     "info": ["The process successful"],
  //   };
  //   console.log(ProfileDTO_)

  //   const data = [ProfileDTO_];
  //   // const datauserauthsService = await this.userauthsService.findOne(emails);
  //   // const datauserbasicsService = await this.userbasicsService.findOne(emails);

  //   // var languages_json = null;
  //   // if (datauserbasicsService.languages != undefined) {
  //   //   languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
  //   // }

  //   // var interest_json = JSON.parse(JSON.stringify(datauserbasicsService.userInterests));
  //   // try {
  //   //   insights_json = JSON.parse(JSON.stringify(datauserbasicsService.insight));
  //   //   var insights = await this.insightsService.findOne(insights_json.$id);
  //   //   insights_res = {
  //   //     shares: insights.shares,
  //   //     followers: insights.followers,
  //   //     comments: insights.comments,
  //   //     followings: insights.followings,
  //   //     reactions: insights.reactions,
  //   //     posts: insights.posts,
  //   //     views: insights.views,
  //   //     likes: insights.likes
  //   //   };
  //   // } catch (e) {
  //   //   insights_res = {
  //   //     shares: 0,
  //   //     followers: 0,
  //   //     comments: 0,
  //   //     followings: 0,
  //   //     reactions: 0,
  //   //     posts: 0,
  //   //     views: 0,
  //   //     likes: 0
  //   //   };
  //   // }
  //   // try {
  //   //   countries_json = JSON.parse(JSON.stringify(datauserbasicsService.countries));
  //   //   countries = await this.countriesService.findOne(countries_json.$id);
  //   //   areas = await this.areasService.findOne(countries.countryID);
  //   //   countri = countries.country;
  //   // } catch (e) {
  //   //   countri = "";
  //   //   areas = "";
  //   // }

  //   // try {
  //   //   cities_json = JSON.parse(JSON.stringify(datauserbasicsService.cities));
  //   //   cities = await this.citiesService.findOne(cities_json.$id);
  //   //   citi = cities.cityName;
  //   // } catch (e) {
  //   //   citi = "";
  //   // }
  //   // const languages = await this.languagesService.findOne(languages_json.$id);
  //   // const interests = await this.interestsService.findOne(interest_json.$id);
  //   // var datagroup = {};
  //   // var datadivision = {};

  //   // var group = await this.groupService.findbyuser(datauserbasicsService._id.toString());
  //   // if (group.length>0){
  //   //   datagroup = {
  //   //       _id: group[0]._id,
  //   //       nameGroup: group[0].nameGroup,
  //   //     }
  //   //   var division = await this.divisionService.findOne(group[0].divisionId.toString());
  //   //   if (division.nameDivision !=undefined) {
  //   //     datadivision = {
  //   //       _id: division._id,
  //   //       nameDivision: division.nameDivision,
  //   //     }
  //   //   }
  //   // }

  //   // try {

  //   //   mediaprofilepicts_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
  //   //   mediaprofilepicts = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
  //   //   var mediaUri = mediaprofilepicts.mediaUri;
  //   //   let result = "/profilepict/" + mediaUri.replace("_0001.jpeg", "");
  //   //   mediaprofilepicts_res = {
  //   //     mediaBasePath: mediaprofilepicts.mediaBasePath,
  //   //     mediaUri: mediaprofilepicts.mediaUri,
  //   //     mediaType: mediaprofilepicts.mediaType,
  //   //     mediaEndpoint: result
  //   //   };
  //   // } catch (e) {
  //   //   mediaprofilepicts_res = {
  //   //     mediaBasePath: "",
  //   //     mediaUri: "",
  //   //     mediaType: "",
  //   //     mediaEndpoint: ""
  //   //   };
  //   // }

  //   // try {
  //   //   interest = [{
  //   //     interestName: interests.interestName,
  //   //     icon: interests.icon,
  //   //     createdAt: interests.createdAt,
  //   //     updatedAt: interests.updatedAt,
  //   //     _class: interests._class,
  //   //   }];
  //   // } catch (err) {
  //   //   interest = [];
  //   // }
  //   // const messages = {
  //   //   "info": ["The process successful"],
  //   // };

  //   // const data = [{
  //   //   "createdAt": datauserbasicsService.createdAt,
  //   //   "areas": areas,
  //   //   "group": datagroup,
  //   //   "division": datadivision,
  //   //   "country": countri,
  //   //   "gender": datauserbasicsService.gender,
  //   //   "idProofNumber": datauserbasicsService.idProofNumber,
  //   //   "city": citi,
  //   //   "mobileNumber": datauserbasicsService.mobileNumber,
  //   //   "roles": datauserauthsService.roles,
  //   //   "fullName": datauserbasicsService.fullName,
  //   //   "bio": datauserbasicsService.bio,
  //   //   "avatar": mediaprofilepicts_res,
  //   //   "isIdVerified": datauserbasicsService.isIdVerified,
  //   //   "isEmailVerified": datauserauthsService.isEmailVerified,
  //   //   "idProofStatus": datauserbasicsService.idProofStatus,
  //   //   "insight": insights_res,
  //   //   "langIso": languages.langIso,
  //   //   "interest": interest,
  //   //   "dob": datauserbasicsService.dob,
  //   //   "event": datauserbasicsService.event,
  //   //   "email": datauserbasicsService.email,
  //   //   "username": datauserauthsService.username,
  //   //   "isComplete": datauserbasicsService.isComplete,
  //   //   "status": datauserbasicsService.status,
  //   // }];

  //   return {
  //     response_code: 202,
  //     data,
  //     messages
  //   };
  // }

  @Post()
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
    var iduser = null;
    var dataakunbank = null;
    var datauserbasicsService = null;
    var isIdVerified = null;
    var statusUser = null;
    var datafrend = null;
    var emailfrend = null;
    var lengfrend = null;
    var langiso = null;
    if (request_json["email"] !== undefined) {
      emails = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    try {
      datauserbasicsService = await this.userbasicsService.findOne(emails);
    } catch (e) {
      datauserbasicsService = null;
    }

    try {
      datafrend = await this.contenteventsService.findfriend(emails);
      console.log(datafrend);
      lengfrend = datafrend.length;
      for (var i = 0; i < lengfrend; i++) {
        emailfrend = datafrend[i]._id.email;

        if (emails === emailfrend) {
          lengfrend = lengfrend - 1;
        }
      }
    } catch (e) {
      datafrend = null;
    }
    console.log(lengfrend);

    if (datauserbasicsService == null) {
      throw new BadRequestException("User not found");
    }
    else {
      iduser = datauserbasicsService._id;
      isIdVerified = datauserbasicsService.isIdVerified;
      if (isIdVerified == true) {
        statusUser = "PREMIUM";
      } else {
        statusUser = "BASIC";
      }
      dataakunbank = await this.userbankaccountsService.findOneUser(iduser);
      var languages_json = null;
      if (datauserbasicsService.languages != undefined) {
        languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
      }
      var datauserauthsService = await this.userauthsService.findOne(emails);
      var interest_json = JSON.parse(JSON.stringify(datauserbasicsService.userInterests));
      var lenghtinteres = interest_json.length;
      var objintetres = {};
      var arrinterest = [];
      var interests = null;
      var languages = null;
      for (var i = 0; i < lenghtinteres; i++) {
        var idinter = interest_json[i].$id;
        interests = await this.interestsService.findOne(idinter);


        objintetres = {
          interestName: interests.interestName,
          icon: interests.icon,
          createdAt: interests.createdAt,
          updatedAt: interests.updatedAt,
          _class: interests._class,
        }

        arrinterest.push(objintetres);
      }
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
          likes: insights.likes,
          friend: lengfrend
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
          likes: 0,
          friend: 0
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
      try {
        languages = await this.languagesService.findOne(languages_json.$id);
        langiso = languages.langIso;
      } catch (e) {
        languages = null;
        langiso = "";
      }

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
        interest = arrinterest;
      } catch (err) {
        interest = [];
      }

      let cl = 'manual';
      if (datauserauthsService.password == '$2a$10$GTQLm6mRlZVoBhR8LSm8T.CDI3TG6CViPdiTAt2tfRY3dNwOk7s1G') {
        cl = 'socmed';
      }
      const data = [{
        "createdAt": datauserbasicsService.createdAt,
        "areas": areas,
        // "group": datagroup,
        // "division": datadivision,
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
        "langIso": langiso,
        "interest": interest,
        "dob": datauserbasicsService.dob,
        "event": datauserbasicsService.event,
        "email": datauserbasicsService.email,
        "username": datauserauthsService.username,
        "isComplete": datauserbasicsService.isComplete,
        "status": datauserbasicsService.status,
        "statusUser": statusUser,
        "databank": dataakunbank,
        "loginSource" : cl
      }];
      var dataGroup = await this.groupService.findbyuser(new mongoose.Types.ObjectId(datauserbasicsService._id.toString()))
      if (dataGroup != null){
        data[0]['groupId'] = dataGroup._id;
        data[0]['group'] = dataGroup.nameGroup;
      }
      return {
        response_code: 202,
        data,
        messages
      };
    }
  }

  @Post('v2')
  @UseGuards(JwtAuthGuard)
  async profileuser2(@Req() request: Request): Promise<any> {


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
    var iduser = null;
    var dataakunbank = null;
    var datauserbasicsService = null;
    var isIdVerified = null;
    var statusUser = null;
    var datafrend = null;
    var emailfrend = null;
    var lengfrend = null;
    var langiso = null;
    if (request_json["email"] !== undefined) {
      emails = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The process successful"],
    };

    try {
      datauserbasicsService = await this.basic2SS.detailDenganlookupLain(emails, "email");
    } catch (e) {
      datauserbasicsService = null;
    }

    if (datauserbasicsService == null) {
      throw new BadRequestException("User not found");
    }
    else {
      var data = datauserbasicsService[0];
      var dataGroup = await this.groupService.findbyuser(data._id);
      if (dataGroup != null){
        data['groupId'] = dataGroup._id;
        data['group'] = dataGroup.nameGroup;
      }
      var getpassword = await this.basic2SS.findBymail(datauserbasicsService[0].email);
      var dummy = 'HyppeNew';
      var checkresult = await this.utilsService.comparePassword(dummy, getpassword.password);
      if(checkresult == true)
      {
        data['loginSource'] = 'socmed';
      }
      else
      {
        data['loginSource'] = 'manual';
      }
      return {
        response_code: 202,
        data:[data],
        messages
      };
    }
  }
}

