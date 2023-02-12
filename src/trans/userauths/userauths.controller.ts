import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res, HttpStatus, Response, Request, Req, BadRequestException } from '@nestjs/common';
import { UserauthsService } from './userauths.service';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth } from './schemas/userauth.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Templates } from '../../infra/templates/schemas/templates.schema';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';

@Controller('api/userauths')
export class UserauthsController {
  constructor(
    private readonly userauthsService: UserauthsService,
    //private readonly utilsService: UtilsService,
    //private readonly errorHandler: ErrorHandler
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
  async getUserActiveChartBasedDate(@Req() request: Request): Promise<any> {
      var data = null;
      var date = null;

      const messages = {
          "info": ["The process successful"],
      };

      var request_json = JSON.parse(JSON.stringify(request.body));
      if (request_json["date"] !== undefined) 
      {
        date = request_json["date"];
      } else 
      {
        throw new BadRequestException("Unabled to proceed");
      }

      var tempdata = await this.userauthsService.getUserActiveByDate(date);
      var getdata = [];
      try
      {
        getdata = tempdata[0].resultdata;
      }
      catch(e)
      {
        getdata = [];
      }

      var startdate = new Date(date);
      startdate.setDate(startdate.getDate() - 1);
      var tempdate = new Date(startdate).toISOString().split("T")[0];
      var end = new Date().toISOString().split("T")[0];
      var array = [];
      
      //kalo lama, berarti error disini!!
      while(tempdate != end)
      {
        var temp = new Date(tempdate);
        temp.setDate(temp.getDate() + 1);
        tempdate = new Date(temp).toISOString().split("T")[0];
        //console.log(tempdate);
      
        let obj = getdata.find(objs => objs._id === tempdate);
        //console.log(obj);
        if(obj == undefined)
        {
          obj = 
          {
            _id : tempdate,
            totaldata : 0
          }
        }
        
        array.push(obj);
      }      

      data = 
      {
        data:array,
        total:(getdata.length == parseInt('0') ? parseInt('0') : tempdata[0].total)
      }

      return { response_code: 202, messages, data };
  }

  @Post('landing-page/recentStory')
  @UseGuards(JwtAuthGuard)
  async getRecentStory(@Req() request: Request): Promise<any> {
    var data = null;
    var email = null;
    
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["email"] !== undefined) 
    {
      email = request_json["email"];
    } else 
    {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
        "info": ["The process successful"],
    };

    data = await this.userauthsService.getRecentStory(email);

    return { response_code:202, data, messages }; 
  }
}
