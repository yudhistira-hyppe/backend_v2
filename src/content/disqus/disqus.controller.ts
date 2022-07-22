import { Body, Controller, Delete, Get, Param, Post, UseGuards, Headers, BadRequestException, Res, HttpStatus, Query, Request, Req } from '@nestjs/common';
import { DisqusService } from './disqus.service';
import { CreateDisqusDto, QueryDiscusDto } from './dto/create-disqus.dto';
import { Disqus } from './schemas/disqus.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FormDataRequest } from 'nestjs-form-data';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { request } from 'https';
@Controller('api/')
export class DisqusController {

  constructor(private readonly DisqusService: DisqusService,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler) { }

  @Post('disqus')
  async create(@Body() CreateDisqusDto: CreateDisqusDto) {
    await this.DisqusService.create(CreateDisqusDto);
  }

  @Get('disqus')
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disqus[]> {
    return this.DisqusService.findAll();
  }

  @Get('disqus/:email')
  async findOneId(@Param('email') email: string): Promise<Disqus> {
    return this.DisqusService.findOne(email);
  }

  @Delete('disqus/:id')
  async delete(@Param('id') id: string) {
    return this.DisqusService.delete(id);
  }

  @Post('posts/disqus/deletedicuss')
  //@UseGuards(JwtAuthGuard)
  async deletedicuss(
    @Headers() headers,
    @Body() request: any) {
    // if (!(await this.utilsService.validasiTokenEmail(headers))) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    // if (request._id == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    // if (request.email == undefined) {
    //   await this.errorHandler.generateNotAcceptableException(
    //     'Unabled to proceed',
    //   );
    // }
    return this.DisqusService.deletedicuss(request);
  }
}
