import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { DisquslogsService } from './disquslogs.service';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs } from './schemas/disquslogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
@Controller()
export class DisquslogsController {
  constructor(private readonly DisquslogsService: DisquslogsService) { }

  @Post()
  async create(@Body() CreateDisquslogsDto: CreateDisquslogsDto) {
    await this.DisquslogsService.create(CreateDisquslogsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsService.findAll();
  }

  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Disquslogs> {
    return this.DisquslogsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.DisquslogsService.delete(id);
  }

  // @Post('api/disquslogs/newcomments')
  // @UseGuards(JwtAuthGuard)
  // async contentmanagemen(@Req() request: Request): Promise<any> {

  //   var email = null;
  //   var request_json = JSON.parse(JSON.stringify(request.body));
  //   if (request_json["email"] !== undefined) {
  //     email = request_json["email"];
  //   } else {
  //     throw new BadRequestException("Unabled to proceed");
  //   }


  //   const messages = {
  //     "info": ["The process successful"],
  //   };

  //   let data = await this.DisquslogsService.findlastcomment(email);

  //   return { response_code: 202, data, messages };
  // }
}
