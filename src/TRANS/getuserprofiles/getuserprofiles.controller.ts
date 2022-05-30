import { Body, Controller, Delete, Get, Param, Post,UseGuards,Query,BadRequestException,Req } from '@nestjs/common';
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
      
      ) {}

    @Post()
    async create(@Body() CreateGetuserprofilesDto: CreateGetuserprofilesDto) {
      await this.getuserprofilesService.create(CreateGetuserprofilesDto);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get()
  async getAllPosts(@Query() { skip, limit }: PaginationParams) {
    return this.getuserprofilesService.findAll(skip, limit);
  }
  
    // @Get(':id')
    // async findOne(@Param('id') id: string): Promise<Getuserprofiles> {
    //   return this.GetuserprofilessService.findOne(id);
    // }
    @Get(':fullName')
    async findOne(@Param('fullName') fullName: String): Promise<Getuserprofiles> {
      return this.getuserprofilesService.findfullname(fullName);
    }
    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.getuserprofilesService.delete(id);
    }

    @Get('getuserprofiles')
    //@FormDataRequest()
    @UseGuards(JwtAuthGuard)
    async profileuser(@Req() request: Request): Promise<any> {
      var request_json = JSON.parse(JSON.stringify(request.body));
      var fullNames=null;
      var genders=null;
      var emails = null;
      var umurs=null;
      var roles=null;
      var interest=[];
      var data=null;
      var datauserbasicsService=null;
      var lisdatatagllahir=null;
      var usservice=null;
    
      if(request_json["fullName"] !== undefined && request_json["gender"] === undefined && request_json["roles"]=== undefined){
        fullNames=request_json["fullName"];
       
        datauserbasicsService = await this.getuserprofilesService.findfullname(fullNames);
      }
     else if(request_json["fullName"] !== undefined && request_json["gender"] !== undefined && request_json["roles"]=== undefined ){
        fullNames=request_json["fullName"];
        genders=request_json["gender"];
         datauserbasicsService = await this.getuserprofilesService.findfullnamegender(fullNames,genders);
      }
    else if(request_json["fullName"] === undefined && request_json["gender"] !== undefined && request_json["roles"]=== undefined){
        genders=request_json["gender"];
       
        datauserbasicsService = await this.getuserprofilesService.findgender(genders);
      }
      else if(request_json["roles"]!== undefined && request_json["fullName"] === undefined && request_json["gender"] === undefined){
        roles=request_json["roles"];
       
        datauserbasicsService = await this.getuserprofilesService.findroles(roles);
      
      }
      else if(request_json["roles"]!== undefined && request_json["fullName"] !== undefined && request_json["gender"] === undefined){
        roles=request_json["roles"];
        fullNames=request_json["fullName"];
        datauserbasicsService = await this.getuserprofilesService.findfullnameroles(fullNames,roles);
     
      }
      else if(request_json["roles"]!== undefined && request_json["fullName"] === undefined && request_json["gender"] !== undefined){
        roles=request_json["roles"];
        genders=request_json["gender"];
        
        datauserbasicsService = await this.getuserprofilesService.findgenderroles(roles,genders);
     
      }
      else if(request_json["roles"]!== undefined && request_json["fullName"] !== undefined && request_json["gender"] !== undefined){
        roles=request_json["roles"];
        genders=request_json["gender"];
        fullNames=request_json["fullName"];
        datauserbasicsService = await this.getuserprofilesService.findfullnamegenderroles(fullNames,roles,genders);

        
     
      }
     else if(request_json["umur"] !== undefined ){
        umurs=request_json["umur"];
      if(umurs==="<15"){
        datauserbasicsService = await this.getuserprofilesService.findAllage15();

        var leng=datauserbasicsService.length();
        console.log(leng);
  
      }
    
     
      
      
      }
      else{
       
       throw new BadRequestException("Unabled to proceed"); 
      }
      // try{
      //   emails=datauserbasicsService.email;
      //   }
      //   catch(err){
      //     throw new BadRequestException("Data tidak ditemukan"); 
      //   }
      //   const datauserauthsService = await this.userauthsService.findOne(emails);
       
      //   var countries_json = JSON.parse(JSON.stringify(datauserbasicsService.countries));
      //   var cities_json = JSON.parse(JSON.stringify(datauserbasicsService.cities));
      //   var languages_json = JSON.parse(JSON.stringify(datauserbasicsService.languages));
      //   var mediaprofilepicts_json = JSON.parse(JSON.stringify(datauserbasicsService.profilePict));
      //   var insights_json = JSON.parse(JSON.stringify(datauserbasicsService.insight));
      //   var interest_json = JSON.parse(JSON.stringify(datauserbasicsService.userInterests));
      //   const countries = await this.countriesService.findOne(countries_json.$id);
      //   const cities = await this.citiesService.findOne(cities_json.$id);
      //   const mediaprofilepicts = await this.mediaprofilepictsService.findOne(mediaprofilepicts_json.$id);
      //   const areas = await this.areasService.findOne(countries.countryID);
      //   const insights = await this.insightsService.findOne(insights_json.$id);
      //   const languages = await this.languagesService.findOne(languages_json.$id);
      //   const interests = await this.interestsService.findOne(interest_json.$id);
      //   var mediaUri =mediaprofilepicts.mediaUri;
    
      //   let result = "/profilepict/"+mediaUri.replace("_0001.jpeg", "");
      //     var mediaprofilepicts_res = { 
      //       mediaBasePath:mediaprofilepicts.mediaBasePath,
      //       mediaUri:mediaprofilepicts.mediaUri,
      //       mediaType:mediaprofilepicts.mediaType,
      //       mediaEndpoint:result 
      //     };
      //     var insights_res = { 
      //       shares:insights.shares,
      //       followers:insights.followers,
      //       comments:insights.comments,
      //       followings:insights.followings,
      //       reactions:insights.reactions,
      //       posts:insights.posts,
      //       views:insights.views,
      //       likes:insights.likes
      //     };
    
      //     try{
      //      interest = [{ 
      //       interestName: interests.interestName,
      //       icon: interests.icon,
      //       createdAt: interests.createdAt,
      //       updatedAt: interests.updatedAt,
      //       _class: interests._class,
      //     }];
      //   }catch(err){
      //     interest=[];
      //   }
       
    
      //    data=[{
      //     "areas":areas.stateName,
      //     "country": countries.country,
      //     "gender":datauserbasicsService.gender,
      //     "idProofNumber":datauserbasicsService.idProofNumber,
      //     "city": cities.cityName,
      //     "mobileNumber":datauserbasicsService.mobileNumber,
      //     "roles":datauserauthsService.roles,
      //     "fullName": datauserbasicsService.fullName,
      //     "bio": datauserbasicsService.bio,
      //     "avatar":mediaprofilepicts_res,
      //   "isIdVerified": datauserbasicsService.isIdVerified,
      //   "isEmailVerified": datauserauthsService.isEmailVerified,
      //   "idProofStatus": datauserbasicsService.idProofStatus,
      //   "insight":insights_res,
      //   "langIso": languages.langIso,
      //   "interest": interest,
      //   "dob": datauserbasicsService.dob,
      //   "event": datauserbasicsService.event,
      //   "email": datauserbasicsService.email,
      //   "username": datauserauthsService.username,
      //   "isComplete": datauserbasicsService.isComplete,
      //   "status": datauserbasicsService.status,
      //   }];



     
  
      return {    response_code: 202,
        data,};
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/getuserprofiles')
    async findAllage15(@Req() request: Request): Promise<Object> {
      var request_json = JSON.parse(JSON.stringify(request.body));
      var umurs=null;
      var data=null;
      const messages = {
        "info":["The process successful"],
      };

      umurs=request_json["umur"];
      if(umurs==="<15"){
       data=await this.getuserprofilesService.findAllage15();
      }
     
      return {    response_code: 202,
        "data":data,
        messages};
    }
}
