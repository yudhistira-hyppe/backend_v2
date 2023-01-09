import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Headers, Res, HttpStatus, Query } from '@nestjs/common';
import { DisquslogsService } from './disquslogs.service';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs } from './schemas/disquslogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { Request } from 'express';
@Controller('api/')
export class DisquslogsController {
  constructor(private readonly DisquslogsService: DisquslogsService,
    private readonly utilsService: UtilsService,
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
  async update(@Res() res, @Param('id') id: string, @Body() createDisquslogsDto: CreateDisquslogsDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.DisquslogsService.update(id, createDisquslogsDto);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
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
