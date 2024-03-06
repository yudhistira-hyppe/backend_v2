import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/monetization')
export class MonetizationController {
  constructor(
    private readonly monetizationService: MonetizationService,
    private readonly utilService: UtilsService,
    private readonly LogAPISS: LogapisService,
  ) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monetizationService.findOne(id);
  }

  @Get()
  async index() {
    return this.monetizationService.find();
  }

  @Post("/create")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coinThumb'))
  async create(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/create";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    let type = body.type;
    let toLog = body;
    delete toLog['coinThumb'];
    let data;

    if (type == 'COIN') {
      data = this.monetizationService.createCoin(file, body);
    }
    else if (type == 'CREDIT') {
      data = this.monetizationService.createCredit(headers, body);
    }

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, toLog);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/list")
  async listAllCoins(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilService.getDateTimeString();
    var url = headers.host + "/api/monetization/list";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var request_json = JSON.parse(JSON.stringify(request.body));
    let skip = (request_json.page > 0 ? (request_json.page - 1) : 0) * request_json.limit;
    var data = await this.monetizationService.listAllCoin(skip, request_json.limit, request_json.descending, request_json.type, request_json.name, request_json.from, request_json.to, request_json.stock_gte, request_json.stock_lte, request_json.status, request_json.audiens);

    var timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/deactivate")
  @UseGuards(JwtAuthGuard)
  async deactivate(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/deactivate";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));
    /*
      Penulisan Notifikasi Paket Kredit: 

      Ind: 
      Title: Selamat! Kamu telah mendapatkan paket kredit Eksklusif [Nama Paket Kredit]. 
      Body: Paket Kredit Eksklusif [Nama Paket Kredit] telah tersedia untukmu. Klik disini untuk mendapatkan paket nya!

      Eng: 
      Title: Congratulations! You have received Exclusive Credit Package [Nama Paket Kredit]. 
      Body: An exclusive credit package [Nama Paket Kredit] is available for you to purchase. Click here to buy the package!
    */
    let data = this.monetizationService.deactivate(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }

  @Post("/delete")
  @UseGuards(JwtAuthGuard)
  async delete(@Req() request: Request, @Headers() headers) {
    let timestamps_start = await this.utilService.getDateTimeString();
    let url = headers.host + "/api/monetization/delete";
    let token = headers['x-auth-token'];
    let auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    let email = auth.email;
    var request_json = JSON.parse(JSON.stringify(request.body));

    let data = this.monetizationService.delete(request_json.id);

    let timestamps_end = await this.utilService.getDateTimeString();
    this.LogAPISS.create2(url, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
      response_code: 202,
      data: data,
      message: {
        "info": ["The process was successful"],
      }
    }
  }
}
