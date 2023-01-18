import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { InsightlogsService } from './insightlogs.service';
import { CreateInsightlogsDto } from './dto/create-insightlogs.dto';
import { Insightlogs } from './schemas/insightlogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
import { InsightsService } from '../../content/insights/insights.service';

@Controller()
export class InsightlogsController {

  constructor(private readonly InsightlogsService: InsightlogsService, private readonly insightsService: InsightsService) { }

  @Post()
  async create(@Body() CreateInsightlogsDto: CreateInsightlogsDto) {
    await this.InsightlogsService.create(CreateInsightlogsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Insightlogs[]> {
    return this.InsightlogsService.findAll();
  }
  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Insightlogs> {
    return this.InsightlogsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.InsightlogsService.delete(id);
  }

  @Post('api/getinsight/view')

  @UseGuards(JwtAuthGuard)
  async insightall(@Req() request: Request): Promise<any> {
    var email = null;
    var date = null;
    var data = null;
    var dataweek1 = null;
    var dataweek2 = null;
    var persentase1 = 0;
    var persentase2 = 0;
    var views1 = 0;
    var views2 = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    var dataall = await this.InsightlogsService.getviewall(email);
    var viewsall = dataall.length;
    try {
      dataweek1 = await this.InsightlogsService.getview1(email, date);
      views1 = dataweek1[0].views;
    } catch (e) {
      dataweek1 = "";
      views1 = 0
    }
    try {
      dataweek2 = await this.InsightlogsService.getview2(email, date);
      views2 = dataweek2[0].views;
    } catch (e) {
      dataweek2 = "";
      views2 = 0;
    }

    var totalviews = views1 + views2;
    var value = null;
    persentase1 = views1 * 100 / totalviews;
    persentase2 = views2 * 100 / totalviews;


    value = (persentase1 - persentase2).toFixed(2);



    var totalnow = dataall.length;


    return { response_code: 202, value, totalnow, messages };
  }
}
