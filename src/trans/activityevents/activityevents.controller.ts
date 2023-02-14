import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers } from '@nestjs/common';
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
  async countPostsesi(@Body('year') year: number, @Headers() headers): Promise<Object> {
    var datasesi = null;
    var countUser = [];
    var awake = null;
    var sleep = null;
    var arrdataview = [];
    var sumfollow = 0;
    const messages = {
      "info": ["The process successful"],
    };

    try {
      datasesi = await this.activityeventsService.sesipengguna();
    } catch (e) {
      datasesi = null;
    }
    if (datasesi !== null) {
      countUser = datasesi[0].countUser;
    } else {
      countUser = [];
    }

    if (countUser.length > 0) {

      for (let i = 0; i < countUser.length; i++) {
        sumfollow += countUser[i].count;

      }

    } else {
      sumfollow = 0;
    }

    var total = sumfollow;
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
              var minutes = Math.round(((difference % 86400000) % 3600000) / 60000);

              console.log(minutes)
              break;
            }
          }
          arrdataview.push({
            'date': tgl,
            'minutes': minutes,

          });
        }

      }

    }

    const sumId = arrdataview.reduce((a, {
      date,
      minutes
    }) => (a[date] = (a[date] || 0) + minutes, a), {});

    console.log(sumId)
    return { response_code: 202, total, arrdataview, messages };
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
