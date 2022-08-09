import { Body, Headers,Controller, Delete, Get, Param, Post,UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ContenteventsService } from './contentevents.service';
import { CreateContenteventsDto } from './dto/create-contentevents.dto';
import { Contentevents } from './schemas/contentevents.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GroupModuleService } from '../../trans/usermanagement/groupmodule/groupmodule.service';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';

@Controller()
export class ContenteventsController {
  constructor(
    private readonly ContenteventsService: ContenteventsService,
    private readonly groupModuleService: GroupModuleService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler) {}

  @Post('api/contentevents')
  async create(@Body() CreateContenteventsDto: CreateContenteventsDto) {
    await this.ContenteventsService.create(CreateContenteventsDto);
  }

  @Get('api/contentevents')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Contentevents[]> {
    return this.ContenteventsService.findAll();
  }

  @Get('api/contentevents/:email')
  async findOneId(@Param('email') email: string): Promise<Contentevents> {
    return this.ContenteventsService.findOne(email);
  }

  @Delete('api/contentevents/:id')
  async delete(@Param('id') id: string) {
    return this.ContenteventsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitynow')
  async countUsersActivityNow(@Body('date') date: Date, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Now', 'view'))){
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.ContenteventsService.UserActivityNow(date);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/contentevents/useractivitybeforetoday')
  async countUserActivityBeforeToday(
    @Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Before-Today', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.ContenteventsService.UserActivityBeforeToday(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysize')
  async countUserActivitySize(@Body('day') day: number, @Headers() headers
  ): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Dashboard-User-Activity-Size', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.ContenteventsService.UserActivitySize(day);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivitysizeYear')
  async countUserActivitySizeYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Size-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.ContenteventsService.UserActivitySizeYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/contentevents/useractivityyear')
  async countUserActivityYear(@Body('year') year: number, @Headers() headers): Promise<Object> {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, email is required',
    //   );
    // }

    // var user_email_header = headers['x-auth-user'];
    // if (!(await this.groupModuleService.validasiModule2(user_email_header, 'Engagement-User-Activity-Year', 'view'))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed, user permission cannot acces module',
    //   );
    // }
    return this.ContenteventsService.UserActivityYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Get('api/friend/:email')
  async friend( @Param('email') email: string, @Headers() headers) {
    var data = await this.ContenteventsService.friend(email,headers);
    return {
      response_code: 202,
      data:data,
      count_friend:(await data).length,
      messages: {
        info: ['Succes Get Friend'],
      },
    };
  }
}
