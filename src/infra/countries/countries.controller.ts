import { Body, Controller, Delete, Get, Param, Post,UseGuards, Headers, Req } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CreateCountriesDto } from './dto/create-countries.dto';
import { Countries } from './schemas/countries.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service';

@Controller('api/countries')
export class CountriesController {

    constructor(private readonly countriesService: CountriesService,
      private readonly logapiSS:LogapisService) {}

    @Post()
    async create(@Body() CreateCountriesDto: CreateCountriesDto) {
      await this.countriesService.create(CreateCountriesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Req() request, @Headers() headers): Promise<Countries[]> {
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var fullurl = request.get("Host") + request.originalUrl;

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

      var data = await this.countriesService.findAll();

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

      return data;

      // return this.countriesService.findAll();
    }
  
    @Get(':id')
    async findOneId(@Param('id') id: string): Promise<Countries> {
      return this.countriesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.countriesService.delete(id);
    }
}
