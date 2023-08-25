import { Body, Controller, Delete, Get, Param, Post,UseGuards, Req, BadRequestException, Headers } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { CreateInsightsDto } from './dto/create-insights.dto';
import { Insights } from './schemas/insights.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller()
export class InsightsController {
  constructor(private readonly InsightsService: InsightsService,
    private readonly logapiSS:LogapisService) {}

  @Post('api/insights')
  async create(@Body() CreateInsightsDto: CreateInsightsDto) {
    await this.InsightsService.create(CreateInsightsDto);
  }

  @Get('api/insights')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Insights[]> {
    return this.InsightsService.findAll();
  }
  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Insights> {
  //   return this.InsightsService.findOne(id);
  // }
  @Get('api/insights/:email')
  async findOneId(@Param('email') email: string): Promise<Insights> {
    return this.InsightsService.findOne(email);
  }

  @Delete('api/insights/:id')
  async delete(@Param('id') id: string) {
    return this.InsightsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/insights/engagement')
  async countPost(@Body('year') year: number): Promise<Object> {
    return this.InsightsService.Engagement(year);
  }

  @Post('api/getinsight')
  @UseGuards(JwtAuthGuard)
  async insight(@Req() request: Request, @Headers() headers): Promise<any> {
    var date = new Date();
    var convert_timestamps_start = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_start = convert_timestamps_start.substring(0, convert_timestamps_start.lastIndexOf('.'));
    
    var data = null;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      var date = new Date();
      var convert_timestamps_end = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = convert_timestamps_end.substring(0, convert_timestamps_end.lastIndexOf('.'));
      var fullurl = request.get("Host") + request.originalUrl;
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, request.body);

      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    data = await this.InsightsService.getInsightbyEmail(email);

    var date = new Date();
    var convert_timestamps_end = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_end = convert_timestamps_end.substring(0, convert_timestamps_end.lastIndexOf('.'));
    var fullurl = request.get("Host") + request.originalUrl;
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, request.body);
    
    return { response_code: 202, data, messages };
  }
}
