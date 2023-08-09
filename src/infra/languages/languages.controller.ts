import { Body, Controller, Delete, Get, Param, Post,UseGuards, Req, Headers } from '@nestjs/common';
import { LanguagesService } from './languages.service';
import { CreateLanguagesDto } from './dto/create-languages.dto';
import { Languages } from './schemas/languages.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('api/languages')
export class LanguagesController {

    constructor(private readonly LanguagesService: LanguagesService,
      private readonly logapiSS: LogapisService) {}

    @Post()
    async create(@Body() CreateLanguagesDto: CreateLanguagesDto) {
      await this.LanguagesService.create(CreateLanguagesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Req() request, @Headers() headers): Promise<Languages[]> {
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var fullurl = request.get("Host") + request.originalUrl;
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

      var data = await this.LanguagesService.findAll();
      
      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);
      
      return data;

      // return this.LanguagesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Languages> {
      return this.LanguagesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.LanguagesService.delete(id);
    }
}
