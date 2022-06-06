import { Body, Controller, Delete, Get, Param, Post,UseGuards,Put,BadRequestException } from '@nestjs/common';
import { GetusercontentsService } from './getusercontents.service';
import { CreateGetusercontentsDto } from './dto/create-getusercontents.dto';
import { Getusercontents } from './schemas/getusercontents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Res, HttpStatus, Response,Req } from '@nestjs/common';
import { Request } from 'express';
@Controller()
export class GetusercontentsController {
    constructor(private readonly getusercontentsService: GetusercontentsService) {}
  
    @Post('api/getusercontents/all')
    @UseGuards(JwtAuthGuard)
    async contentuserall(@Req() request: Request): Promise<any> {

        var email=null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json["email"] !== undefined){
            email=request_json["email"] ;
        }else{
            throw new BadRequestException("Unabled to proceed"); 
        }


        const messages = {
        "info":["The process successful"],
        };
   
      let  data = await this.getusercontentsService.findalldata(email);     

        return {    response_code: 202, data, messages}; 
    }

    @Post('api/getusercontents/latest')
    @UseGuards(JwtAuthGuard)
    async contentuserlatest(@Req() request: Request): Promise<any> {

        var email=null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json["email"] !== undefined){
            email=request_json["email"] ;
        }else{
            throw new BadRequestException("Unabled to proceed"); 
        }


        const messages = {
        "info":["The process successful"],
        };
   
      let  data = await this.getusercontentsService.findlatesdata(email);     

        return {    response_code: 202, data, messages}; 
    }

    
    @Post('api/getusercontents/popular')
    @UseGuards(JwtAuthGuard)
    async contentuser(@Req() request: Request): Promise<any> {

        var email=null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json["email"] !== undefined){
            email=request_json["email"] ;
        }else{
            throw new BadRequestException("Unabled to proceed"); 
        }


        const messages = {
        "info":["The process successful"],
        };
   
      let  data = await this.getusercontentsService.findpopular(email);     

        return {    response_code: 202, data, messages}; 
    }

    @Post('api/getusercontents/search')
    @UseGuards(JwtAuthGuard)
    async contentusersearch(@Req() request: Request): Promise<any> {

        var email=null;
        var title=null;
        var request_json = JSON.parse(JSON.stringify(request.body));
        if(request_json["email"] !== undefined){
            email=request_json["email"] ;
        }else{
            throw new BadRequestException("Unabled to proceed"); 
        }

        if(request_json["title"] !== undefined){
            title=request_json["title"] ;
        }else{
            throw new BadRequestException("Unabled to proceed"); 
        }


        const messages = {
        "info":["The process successful"],
        };
   
      let  data = await this.getusercontentsService.findsearch(email,title);     

        return {    response_code: 202, data, messages}; }

}
