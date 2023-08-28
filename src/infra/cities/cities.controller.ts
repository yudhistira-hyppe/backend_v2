import { Body, Controller, Delete, Get, Param, Post,UseGuards, Req, Headers } from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCitiesDto } from './dto/create-cities.dto';
import { Cities } from './schemas/cities.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service'; 

@Controller('api/cities')
export class CitiesController {

    constructor(private readonly citiesService: CitiesService,
      private readonly logapiSS:LogapisService) {}

    @Post()
    async create(@Body() CreateCitiesDto: CreateCitiesDto) {
      await this.citiesService.create(CreateCitiesDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Headers() headers,@Req() request): Promise<Cities[]> {
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var fullurl = request.get("Host") + request.originalUrl;

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

      var data = await this.citiesService.findAll();

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

      return data;

      //return this.citiesService.findAll();
    }
  
    @Get(':id')
    async findOne(@Param('id') id: String): Promise<Cities> {
      return this.citiesService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.citiesService.delete(id);
    }
}
