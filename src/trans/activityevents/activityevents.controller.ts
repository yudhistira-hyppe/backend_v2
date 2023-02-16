import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, Req } from '@nestjs/common';
import { ActivityeventsService } from './activityevents.service';
import { CreateActivityeventsDto } from './dto/create-activityevents.dto';
import { Activityevents } from './schemas/activityevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';


@Controller('api/activityevents')
export class ActivityeventsController {
  constructor(private readonly activityeventsService: ActivityeventsService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler) { }

  @Post()
  async create(@Body() CreateActivityeventsDto: CreateActivityeventsDto) {
    await this.activityeventsService.create(CreateActivityeventsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Activityevents[]> {
    return this.activityeventsService.findAll();
  }

  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Activityevents> {
    return this.activityeventsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.activityeventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logactivitas')
  async countPost(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-Log-Activitas', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.activityeventsService.LogActivitas(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logactivitas/sesi')
  async countPostsesi(@Req() request, @Headers() headers): Promise<Object> {
    var datasesi = null;
    var countUser = [];
    var awake = null;
    var sleep = null;
    var arrdataview = [];
    var arrdata = [];
    var sumMinute = [];
    var sumUser = [];
    var startdate = null;
    var enddate = null;
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasesi = await this.activityeventsService.sesipengguna(startdate, enddate);
    } catch (e) {
      datasesi = null;
    }
    if (datasesi !== null) {
      countUser = datasesi[0].countUser;
    } else {
      countUser = [];
    }

    if (countUser.length > 0) {
      var sumUser = [];
      countUser.reduce(function (res, value) {
        if (!res[value.date]) {
          res[value.date] = { date: value.date, count: 0 };
          sumUser.push(res[value.date])
        }
        res[value.date].count += value.count;
        return res;
      }, {});

      console.log(sumUser)

    }


    if (datasesi !== null) {
      awake = datasesi[0].awake;
    } else {
      awake = [];
    }

    if (datasesi !== null) {
      sleep = datasesi[0].sleep;
    } else {
      sleep = [];
    }

    if (awake.length > 0) {

      for (let i = 0; i < awake.length; i++) {
        let createdAwake = new Date(awake[i].createdAt);
        var tgl = awake[i].tgl;
        if (sleep.length > 0) {
          for (var j = 0; j < sleep.length; j++) {
            if (sleep[j].createdAt != null) {
              let createdSleep = new Date(sleep[j].createdAt);
              var difference = Math.abs(createdSleep.getTime() - createdAwake.getTime());
              var count = Math.round(((difference % 86400000) % 3600000) / 60000);
              break;
            }
          }
          arrdataview.push({
            'date': tgl,
            'count': count,

          });
        }

      }

    }

    if (arrdataview.length > 0) {
      var sumMinute = [];
      arrdataview.reduce(function (res, value) {
        if (!res[value.date]) {
          res[value.date] = { date: value.date, count: 0 };
          sumMinute.push(res[value.date])
        }
        res[value.date].count += value.count;
        return res;
      }, {});

      console.log(sumMinute)

    }

    if (sumMinute.length > 0) {
      for (let i = 0; i < sumMinute.length; i++) {
        let countminute = sumMinute[i].count;
        let tgl = sumMinute[i].date;
        if (sumUser.length > 0) {
          for (var j = 0; j < sumUser.length; j++) {
            var countuser = sumUser[j].count;
            if (sumUser[j].date == tgl) {
              var counting = Math.round(countminute / countuser);
              break;
            }
          }
          arrdata.push({
            'date': tgl,
            'count': counting,

          });
        }

      }

    }

    var data = [];
    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var count = 0;
        for (var j = 0; j < arrdata.length; j++) {
          if (arrdata[j].date == stdt) {
            count = arrdata[j].count;
            break;
          }
        }
        data.push({
          'date': stdt,
          'count': count
        });

      }

    }

    return { response_code: 202, data, messages };
  }


  @UseGuards(JwtAuthGuard)
  @Post('logactivitas/useractive')
  async countPostsesiactiv(@Req() request): Promise<Object> {
    var datasesi = null;
    var countUser = [];
    var sumUser = [];
    var startdate = null;
    var enddate = null;
    const messages = {
      "info": ["The process successful"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    startdate = request_json["startdate"];
    enddate = request_json["enddate"];

    var date1 = new Date(startdate);
    var date2 = new Date(enddate);

    //calculate time difference  
    var time_difference = date2.getTime() - date1.getTime();

    //calculate days difference by dividing total milliseconds in a day  
    var resultTime = time_difference / (1000 * 60 * 60 * 24);
    console.log(resultTime);
    try {
      datasesi = await this.activityeventsService.sesipengguna(startdate, enddate);
    } catch (e) {
      datasesi = null;
    }
    if (datasesi !== null) {
      countUser = datasesi[0].countUser;
    } else {
      countUser = [];
    }

    if (countUser.length > 0) {
      var sumUser = [];
      countUser.reduce(function (res, value) {
        if (!res[value.date]) {
          res[value.date] = { date: value.date, count: 0 };
          sumUser.push(res[value.date])
        }
        res[value.date].count += value.count;
        return res;
      }, {});

      console.log(sumUser)

    }

    var data = [];
    if (resultTime > 0) {
      for (var i = 0; i < resultTime + 1; i++) {
        var dt = new Date(startdate);
        dt.setDate(dt.getDate() + i);
        var splitdt = dt.toISOString();
        var dts = splitdt.split('T');
        var stdt = dts[0].toString();
        var count = 0;
        for (var j = 0; j < sumUser.length; j++) {
          if (sumUser[j].date == stdt) {
            count = sumUser[j].count;
            break;
          }
        }
        data.push({
          'date': stdt,
          'count': count
        });

      }

    }

    return { response_code: 202, data, messages };
  }



  @Post('list')
  //@FormDataRequest()
  @UseGuards(JwtAuthGuard)
  async profileuse(): Promise<any> {

    var data = null;


    const messages = {
      "info": ["The process successful"],
    };


    data = await this.activityeventsService.findevents();

    return { response_code: 202, data, messages };
  }
}
