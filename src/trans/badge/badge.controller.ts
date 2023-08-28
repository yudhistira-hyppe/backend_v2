import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Req, UseInterceptors, UploadedFiles, Res, HttpStatus, Headers } from '@nestjs/common';
import { BadgeService } from './badge.service';
import { CreateBadgeDto } from './dto/create-badge.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { badge } from './schemas/badge.schema';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';
import { OssService } from 'src/stream/oss/oss.service';
import { UtilsService } from 'src/utils/utils.service';
import { LogapisService } from '../logapis/logapis.service';

@Controller('api/badge')
export class BadgeController {
  constructor(private readonly badgeService: BadgeService,
    private readonly ossservices : OssService,
    private readonly utilservice : UtilsService,
    private readonly logAPISS : LogapisService,
    ) {}

  // @UseGuards(JwtAuthGuard)
  // @Post()
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'badge_profile', maxCount: 1 }, { name: 'badge_general', maxCount:1 }]))
  // async create(
  //   @UploadedFiles() files: { 
  //     badge_profile?: Express.Multer.File[]
  //     badge_general?: Express.Multer.File[]
  //   },
  //   @Body() request,
  //   @Res() res,
  // ) {

  //   var mongoose = require('mongoose');
  //   var dt = new Date(Date.now());
  //   dt.setHours(dt.getHours() + 7); // timestamp
  //   var hasilconvert = dt.toISOString().split("T");
  //   var convert = hasilconvert[0] + " " + hasilconvert[1].split(".")[0];

  //   var insertdata = new CreateBadgeDto();
  //   var tempid = new mongoose.Types.ObjectId();
  //   insertdata._id = tempid;
  //   insertdata.createdAt = convert;
  //   insertdata.name = request.name;
  //   var stringdata = request.type;
  //   insertdata.type = stringdata.toUpperCase();

  //   if(files.badge_general == undefined)
  //   {
  //     throw new BadRequestException("Unabled to proceed. badge general is required");
  //   }

  //   if(files.badge_profile == undefined)
  //   {
  //     throw new BadRequestException("Unabled to proceed. badge profile is required");
  //   }

  //   const messages = {
  //     "info": ["The process successful"],
  //   };

  //   const messagesEror = {
  //     "info": ["Todo is not found!"],
  //   };

  //   try
  //   {
  //     await this.badgeService.create(insertdata);

  //     //upload badge general
  //     var insertfile = files.badge_general[0];
  //     var path = "images/badge/" + tempid + "_general_" + "." + insertfile.originalname.split(".")[1];
  //     var result = await this.ossservices.uploadFile(insertfile, path);
  //     insertdata.badgeOther = result.url;

  //     //upload badge profile
  //     var insertfile = files.badge_profile[0];
  //     var path = "images/badge/" + tempid + "_profile_" + "." + insertfile.originalname.split(".")[1];
  //     var result = await this.ossservices.uploadFile(insertfile, path);
  //     insertdata.badgeProfile = result.url;

  //     await this.badgeService.update(tempid, insertdata);

  //     return res.status(HttpStatus.OK).json({
  //         response_code: 202,
  //         "data": insertdata,
  //         "message": messages
  //     });
  //   }
  //   catch(e)
  //   {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       "message": messagesEror
  //     });
  //   }
  // }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'badge_profile', maxCount: 1 }, { name: 'badge_general', maxCount:1 }]))
  async create(
    @UploadedFiles() files: { 
      badge_profile?: Express.Multer.File[]
      badge_general?: Express.Multer.File[]
    },
    @Body() request,
    @Res() res,
    @Headers() headers
  ) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var fullurl = headers.host + "/api/badge";
    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try
    {
      var data = await this.badgeService.create(files.badge_general, files.badge_profile, request);
      var timestamps_end = await this.utilservice.getDateTimeString();
      // request['badge_general'] = files.badge_general;
      // request['badge_profile'] = files.badge_profile;
      this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request);
      return res.status(HttpStatus.OK).json({
          response_code: 202,
          "data": data,
          "message": messages
      });
    }
    catch(e)
    {
      var timestamps_end = await this.utilservice.getDateTimeString();
      // request['badge_general'] = files.badge_general;
      // request['badge_profile'] = files.badge_profile;
      this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request);
      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() request, @Headers() headers) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var fullurl = request.get("Host") + request.originalUrl;

    var data = await this.badgeService.findAll();

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilservice.getDateTimeString();
    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  // listing get badge berdasarkan tipe juara
  @UseGuards(JwtAuthGuard)
  @Post('findall')
  async findAllByType(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var fullurl = headers.host + '/api/badge/findall';

    var listjuara = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    
    if (request_json["juara"] !== undefined) {
      listjuara = [request_json["juara"]];
    }

    var data = await this.badgeService.detailAll(null, listjuara, null, null);

    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilservice.getDateTimeString();
    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('listing')
  async detailAll(@Req() request: Request, @Headers() headers) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var email = auth.email;
    var fullurl = headers.host + "/api/badge/listing";

    var page = null;
    var limit = null;
    var search = null;
    var listjuara = null;

    var request_json = JSON.parse(JSON.stringify(request.body));

    
    if (request_json["search"] !== undefined) {
      search = request_json["search"];
    }
    
    if(request_json["listjuara"] !== undefined)
    {
      listjuara = request_json["listjuara"];
    }

    if (request_json["page"] !== undefined) {
        page = Number(request_json["page"]);
    } else {
        var timestamps_end = await this.utilservice.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, page field is required");
    }

    if (request_json["limit"] !== undefined) {
        limit = Number(request_json["limit"]);
    } else {
        var timestamps_end = await this.utilservice.getDateTimeString();
        this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        throw new BadRequestException("Unabled to proceed, limit field is required");
    }

    var data = await this.badgeService.detailAll(search, listjuara, page, limit);
    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilservice.getDateTimeString();
    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var fullurl = request.get("Host") + request.originalUrl;

    var data = await this.badgeService.findOne(id);
    const messages = {
      "info": ["The process successful"],
    };

    var timestamps_end = await this.utilservice.getDateTimeString();
    this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, null);

    return {
        response_code: 202,
        data:data,
        messages: messages,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('/update/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'badge_profile', maxCount: 1 }, { name: 'badge_general', maxCount:1 }]))
  async update(
    @Param('id') id: string,
    @UploadedFiles() files: { 
      badge_profile?: Express.Multer.File[]
      badge_general?: Express.Multer.File[]
    },
    @Body() request,
    @Res() res,
    @Headers() headers
  ) {
    var timestamps_start = await this.utilservice.getDateTimeString();
    var fullurl = headers.host + "/api/badge/" + id;

    const messages = {
      "info": ["The process successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try
    {
      var data = await this.badgeService.update(id, files.badge_general, files.badge_profile, request);

      var timestamps_end = await this.utilservice.getDateTimeString();
      this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request);

      return res.status(HttpStatus.OK).json({
          response_code: 202,
          "data": data,
          "message": messages
      });
    }
    catch(e)
    {
      var timestamps_end = await this.utilservice.getDateTimeString();
      this.logAPISS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, request);

      return res.status(HttpStatus.BAD_REQUEST).json({
        "message": messagesEror
      });
    }
  }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   return this.badgeService.remove(+id);
  // }
}
