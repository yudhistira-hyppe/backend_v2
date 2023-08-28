import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Headers, Res, HttpStatus, Query, Req, Head } from '@nestjs/common';
import { DisquslogsService } from './disquslogs.service';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs } from './schemas/disquslogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { Request } from 'express';
import { logApis } from 'src/trans/logapis/schema/logapis.schema';
@Controller('api/')
export class DisquslogsController {
  constructor(private readonly DisquslogsService: DisquslogsService,
    private readonly utilsService: UtilsService,
    private readonly logapiSS : LogapisService,
    private readonly errorHandler: ErrorHandler) { }

  @Post('disquslogs')
  async create(@Body() CreateDisquslogsDto: CreateDisquslogsDto) {
    await this.DisquslogsService.create(CreateDisquslogsDto);
  }

  @Get('disquslogs')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsService.findAll();
  }

  @Get('disquslogs/:id')
  async findOneId(@Param('id') id: string): Promise<Disquslogs> {
    return this.DisquslogsService.findOne(id);
  }

  @Delete('disquslogs/:id')
  async delete(@Param('id') id: string) {
    return this.DisquslogsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('disquslogs/:id')
  async update(@Res() res, @Param('id') id: string, @Body() createDisquslogsDto: CreateDisquslogsDto, @Req() req, @Headers() headers) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.DisquslogsService.update(id, createDisquslogsDto);
      
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(createDisquslogsDto));
      reqbody['disquslogID'] = id;
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      var fullurl = req.get("Host") + req.originalUrl;
      var timestamps_end = await this.utilsService.getDateTimeString();
      var reqbody = JSON.parse(JSON.stringify(createDisquslogsDto));
      reqbody['disquslogID'] = id;
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }

  // @Post('posts/disqus/deletedicusslog')
  // @UseGuards(JwtAuthGuard)
  // async deletedicusslog(
  //   @Headers() headers,
  //   @Body() request: any) {
  //   if (!(await this.utilsService.validasiTokenEmail(headers))) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed',
  //     );
  //   }
  //   if (request._id == undefined) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed',
  //     );
  //   }
  //   if (!(await this.utilsService.validasiTokenEmail(headers))) {
  //     await this.errorHandler.generateNotAcceptableException(
  //       'Unabled to proceed',
  //     );
  //   }
  //   return this.DisquslogsService.deletedicusslog(request);
  // }
}
