import { Body, Controller, Delete, Get, Param, Post, UseGuards, Req, BadRequestException, Request, UploadedFile, UploadedFiles, Headers, UseInterceptors, Res, HttpStatus } from '@nestjs/common';
import { BanksService } from './banks.service';
import { CreateBanksDto } from './dto/create-banks.dto';
import { Banks } from './schemas/banks.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OssService } from 'src/stream/oss/oss.service';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express/multer';
import { LogapisService } from '../logapis/logapis.service';

@Controller()
export class BanksController {
    constructor(private readonly banksService: BanksService,
                private readonly OssServices: OssService,
                private readonly logapiSS: LogapisService) { }

    @UseGuards(JwtAuthGuard)
    @Get('api/banks/all')
    async findAll(@Req() req, @Headers() headers) {
        var fullurl = req.get("Host") + req.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email; 
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
      
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findAll();

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/list/all')
    async findAll2(@Req() request: Request, @Headers() headers) {
        var fullurl = headers.host + '/api/banks/list/all';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email; 
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

        const messages = {
            "info": ["The process successful"],
        };
        var bankname = null;
        var page = null;
        var limit = null;
        var isactive = null

        var request_json = JSON.parse(JSON.stringify(request.body));
        if (request_json["bankname"] !== undefined) {
          bankname = request_json["bankname"];
        }

        if (request_json["page"] !== undefined) {
          page = request_json["page"];
        }

        if (request_json["limit"] !== undefined) {
          limit = request_json["limit"];
        }

        if (request_json["activestatus"] !== undefined) {
          isactive = request_json["activestatus"];
        }

        let data = await this.banksService.listingAll(bankname, isactive, page, limit);

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/search')
    async findbank(@Req() request: Request, @Headers() headers) {
        var fullurl = headers.host + '/api/banks/search';
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email; 
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

        var request_json = JSON.parse(JSON.stringify(request.body));
        var bankcode = null;
        if (request_json["bankcode"] !== undefined) {
            bankcode = request_json["bankcode"];
        } else {
            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

            throw new BadRequestException("Unabled to proceed");
        }
        const messages = {
            "info": ["The process successful"],
        };

        let data = await this.banksService.findbankcode(bankcode);

        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

        return { response_code: 202, data, messages };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_bank', maxCount: 1 }]))
    async create(
      @UploadedFiles() files: { 
        icon_bank?: Express.Multer.File[]
      },
    //   @Body() request,
    @Body() CreateBanksDto: CreateBanksDto,
    @Req() request,
    @Headers() headers
      ) {
      var fullurl = request.get("Host") + request.originalUrl;
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var email = auth.email; 
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
      var reqbody = JSON.parse(JSON.stringify(CreateBanksDto));

    //   console.log(CreateBanksDto);

      if(files.icon_bank == undefined)
      {
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

        throw new BadRequestException("Unabled to proceed. icon file is required");
      }
      else
      {
        var getresult = await this.banksService.create(CreateBanksDto);

        var insertfile = files.icon_bank[0];
        var getdata = getresult._id.toString();
        var path = "images/icon_bank/" + getdata + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        CreateBanksDto.bankIcon = result.url;
        var id = getresult._id;
        var converttostring = id.toString();
        await this.banksService.update(converttostring, CreateBanksDto);
      }

      const messages = {
        "info": ["The process successful"],
      };

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

      return {
          response_code: 202,
          data: CreateBanksDto,
          messages: messages,
      };
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/update/:id')
    @UseInterceptors(FileFieldsInterceptor([{ name: 'icon_bank', maxCount: 1 }]))
    async edit(
      @UploadedFiles() files: { 
        icon_bank?: Express.Multer.File[]
      },
        @Param('id') id: string,
        @Body() CreateBanksDto: CreateBanksDto,
        @Res() res,
        @Req() request,
        @Headers() headers
      ) {
        var fullurl = request.get("Host") + request.originalUrl;
        var token = headers['x-auth-token'];
        var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        var email = auth.email; 
        var date = new Date();
        var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
        var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));
        var reqbody = JSON.parse(JSON.stringify(CreateBanksDto));
        var id = id;
      
      if(files.icon_bank != undefined)
      {
        var insertfile = files.icon_bank[0];
        var path = "images/icon_bank/" + id + "." + insertfile.originalname.split(".")[1];
        var result = await this.OssServices.uploadFile(insertfile, path);
        CreateBanksDto.bankIcon = result.url;
      }

    //   console.log(CreateBanksDto);

        try {
            await this.banksService.update(id, CreateBanksDto);

            const messages = {
                "info": ["The process successful"],
            };

            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.OK).json({
                response_code: 202,
                data: CreateBanksDto,
                messages: messages,
            });
        } catch (e) {
            const messagesEror = {
                "info": ["Todo is not found!"],
              };

            var date = new Date();
            var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
            var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
            this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, reqbody);

            return res.status(HttpStatus.BAD_REQUEST).json({
                "message": messagesEror
            });
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('api/banks/delete/:id')
    async softdelete(
        @Param('id') id: string,
        @Headers() headers,
        @Body() CreateBanks: CreateBanksDto,
        @Req() request
    ) {
      var fullurl = request.get("Host") + request.originalUrl;
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var email = auth.email; 
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

      // var updatedata = new CreateBanksDto();
      // updatedata['isActive'] = CreateBanksDto.isActive;

      var updatedata = new CreateBanksDto();
      updatedata.isActive = CreateBanks.isActive;

      await this.banksService.update(id, updatedata);

      const messages = {
          "info": ["The process successful"],
      };

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, null);

      return {
          response_code: 202,
          messages: messages,
      };
    }

}
