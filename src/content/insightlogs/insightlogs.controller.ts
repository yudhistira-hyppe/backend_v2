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

  @Post('api/getinsight')

  @UseGuards(JwtAuthGuard)
  async insight(@Req() request: Request): Promise<any> {
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    const messages = {
      "info": ["The process successful"],
    };

    var datanull = null;
    var like = 0;
    var totallike = 0;
    var totalfolowwers = 0;
    var totalfolowwings = 0;

    var status = "";
    var statusfollower = "";
    var statusfollowing = "";
    var data = null;

    try {
      var datalike = await this.InsightlogsService.getlike(email);
      var datafollower = await this.InsightlogsService.getfollowers(email);
      var datafollowing = await this.InsightlogsService.getfollowing(email);
      var datainsight = await this.insightsService.getinsight(email);

      var like1 = datalike[0].like;
      var like2 = datalike[1].like;
      var followers1 = datafollower[0].followers;
      var followers2 = datafollower[1].followers;
      var following1 = datafollowing[0].followings;
      var following2 = datafollowing[1].followings;
      totallike = datainsight[0].likes;
      totalfolowwers = datainsight[0].followers;
      totalfolowwings = datainsight[0].followings;

      if (like1 > like2) {
        status = "up";
      } else {
        status = "down";
      }

      if (followers1 > followers2) {
        statusfollower = "up";
      } else {
        statusfollower = "down";
      }

      if (following1 > following2) {
        statusfollowing = "up";
      } else {
        statusfollowing = "down";
      }

      data = [
        {
          "Likes": {
            "like": like1,
            "status": status,
            "totalsekarang": totallike
          },
          "Follower": {
            "followers": followers1,
            "status": statusfollower,
            "totalsekarang": totalfolowwers
          },
          "Following": {
            "followings": following1,
            "status": statusfollowing,
            "totalsekarang": totalfolowwings
          }
        }];



    }
    catch (e) {
      data = [
        {
          "Likes": {
            "like": 0,
            "status": "",
            "totalsekarang": 0
          },
          "Follower": {
            "followers": 0,
            "status": "",
            "totalsekarang": 0
          },
          "Following": {
            "followings": 0,
            "status": "",
            "totalsekarang": 0
          }
        }];
    }
    return { response_code: 202, data, messages };
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
