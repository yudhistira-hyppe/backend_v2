import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res, HttpStatus, Response, Request, Req, BadRequestException, Headers } from '@nestjs/common';
import { UserauthsService } from './userauths.service';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth } from './schemas/userauth.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Templates } from '../../infra/templates/schemas/templates.schema';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/userauths')
export class UserauthsController {
  constructor(
    private readonly userauthsService: UserauthsService,
    private readonly logapiSS: LogapisService

  ) { }

  @Post()
  async create(@Body() CreateUserauthDto: CreateUserauthDto) {
    await this.userauthsService.create(CreateUserauthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userauth[]> {
    return this.userauthsService.findAll();
  }

  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(id);
  // }
  // @Get(':username')
  // async findOne(@Param('username') username: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(username);
  // }
  @Get(':email')
  async findOne(@Param('email') email: string): Promise<Userauth> {
    return this.userauthsService.findOne(email);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userauthsService.delete(id);
  }

  @Post('useractivebychart')
  @UseGuards(JwtAuthGuard)
  async getUserActiveChartBasedDate(@Req() request: Request, @Headers() headers): Promise<any> {
    var setdate = new Date();
    var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
    var fullurl = headers.host + '/api/userauths/useractivebychart';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    
    var data = null;
    var date = null;

    const messages = {
      "info": ["The process successful"],
    };

    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["date"] !== undefined) {
      date = request_json["date"];
    } else {
      var setdate = new Date();
      var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

      throw new BadRequestException("Unabled to proceed");
    }

    var tempdata = await this.userauthsService.getUserActiveByDate(date);
    var getdata = [];
    try {
      getdata = tempdata[0].resultdata;
    }
    catch (e) {
      getdata = [];
    }

    var startdate = new Date(date);
    startdate.setDate(startdate.getDate() - 1);
    var tempdate = new Date(startdate).toISOString().split("T")[0];
    var end = new Date().toISOString().split("T")[0];
    var array = [];

    //kalo lama, berarti error disini!!
    while (tempdate != end) {
      var temp = new Date(tempdate);
      temp.setDate(temp.getDate() + 1);
      tempdate = new Date(temp).toISOString().split("T")[0];
      //console.log(tempdate);

      let obj = getdata.find(objs => objs._id === tempdate);
      //console.log(obj);
      if (obj == undefined) {
        obj =
        {
          _id: tempdate,
          totaldata: 0
        }
      }

      array.push(obj);
    }

    data =
    {
      data: array,
      total: (getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
    }

    var setdate = new Date();
    var DateTime = new Date(setdate.getTime() - (setdate.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
    var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return { response_code: 202, messages, data };
  }
}
