import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException, Res, HttpStatus, Query, Request, Req } from '@nestjs/common';
import { DisqusService } from './disqus.service';
import { CreateDisqusDto, QueryDiscusDto } from './dto/create-disqus.dto';
import { Disqus } from './schemas/disqus.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { request } from 'https';
@Controller('api/')
export class DisqusController {

  constructor(private readonly DisqusService: DisqusService) { }

  @Post('disqus')
  async create(@Body() CreateDisqusDto: CreateDisqusDto) {
    await this.DisqusService.create(CreateDisqusDto);
  }

  @Get('disqus')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disqus[]> {
    return this.DisqusService.findAll();
  }

  @Get('disqus/:email')
  async findOneId(@Param('email') email: string): Promise<Disqus> {
    return this.DisqusService.findOne(email);
  }

  @Delete('disqus/:id')
  async delete(@Param('id') id: string) {
    return this.DisqusService.delete(id);
  }

  @Post('posts/disqus/deletedicuss')
  async deletedicuss(
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email_header: string,
    @Body() request :string) {
    return this.DisqusService.deletedicuss(request);
  }

  @Post('posts/disqus')
  @FormDataRequest()
  async querydisqus(@Body() QueryDiscusDto_: QueryDiscusDto) {
    console.log(QueryDiscusDto_.isQuery);
    var data = {};
    if (!QueryDiscusDto_.isQuery){
      if (QueryDiscusDto_.eventType =="DIRECT_MSG") {

      } else if (QueryDiscusDto_.eventType == "COMMENT") {

      }
    }else{
      if (QueryDiscusDto_.eventType == "DIRECT_MSG") {
        if (QueryDiscusDto_.receiverParty==undefined){
          data = {
            email: QueryDiscusDto_.email,
          }
        }else{
          data = {
            email: QueryDiscusDto_.email,
            mate: QueryDiscusDto_.receiverParty,
          }
        }
      } else if (QueryDiscusDto_.eventType == "COMMENT") {

      }
    }
    //return this.DisqusService.deletedicuss(_id, email);
  }


}
