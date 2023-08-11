import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Req, BadRequestException, Headers } from '@nestjs/common';
import { JenischallengeService } from './jenischallenge.service';
import { CreateJenischallengeDto } from './dto/create-jenischallenge.dto';
import { jenisChallenge } from './schemas/jenischallenge.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from '../logapis/logapis.service';
import { UtilsService } from 'src/utils/utils.service';

@Controller('api/jenischallenge')
export class JenischallengeController {
  constructor(private readonly jenischallenge: JenischallengeService, private readonly utilsService: UtilsService, private readonly logapiSS: LogapisService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createJenischallengeDto: CreateJenischallengeDto, @Req() req, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = req.get("Host") + req.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var reqbody = JSON.parse(JSON.stringify(createJenischallengeDto));
    
    var data = await this.jenischallenge.create(createJenischallengeDto);
    
    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

    return {
        response_code: 202,
        data:createJenischallengeDto,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req, @Headers() headers): Promise<jenisChallenge[]> {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = req.get("Host") + req.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    
    var data = await this.jenischallenge.findAll();

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return data;
    
    // return this.jenischallenge.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async detailfindAll(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "api/jenischallenge/listing";
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;

    var page = null;
    var limit = null;
    var search = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    if (request_json["search"] !== undefined) {
      search = request_json["search"];
    }

    if (request_json["page"] !== undefined) {
        page = Number(request_json["page"]);
    } else {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
        limit = Number(request_json["limit"]);
    } else {
        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    var data = await this.jenischallenge.detailAll(search, page, limit);
    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Headers() headers, @Req() request) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    
    var data = await this.jenischallenge.findOne(id);
    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() createJenischallengeDto: CreateJenischallengeDto, @Headers() headers, @Req() request) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var reqbody = JSON.parse(JSON.stringify(createJenischallengeDto));
    
    var data = await this.jenischallenge.update(id, createJenischallengeDto);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilsService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

    return {
        response_code: 202,
        data:createJenischallengeDto,
        messages: messages,
    };
  }

  // @UseGuards(JwtAuthGuard)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.jenischallengeService.remove(id);
  // }
}
