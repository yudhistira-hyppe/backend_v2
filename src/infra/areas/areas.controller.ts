import { Body, Controller, Delete, Get, Param, Post,UseGuards, Headers, Req } from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreasDto } from './dto/create-areas.dto';
import { Areas } from './schemas/areas.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { LogapisService } from 'src/trans/logapis/logapis.service'; 


@Controller('api/areas')
export class AreasController {

    constructor(private readonly areasService: AreasService,
      private readonly logapiSS:LogapisService) {}

    @Post()
    async create(@Body() CreateAreasDto: CreateAreasDto) {
      await this.areasService.create(CreateAreasDto);
    }

    // @Get()
    // @UseGuards(JwtAuthGuard)
    // async findAll(): Promise<Areas[]> {
    //   return this.areasService.findAll();
    // }

    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll(@Headers() headers, @Req() request): Promise<Areas[]> {
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var fullurl = request.get("Host") + request.originalUrl;

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_start = DateTime.substring(0, DateTime.lastIndexOf('.'));

      var data = await this.areasService.findAll();

      var date = new Date();
      var DateTime = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().replace('T', ' ');
      var timestamps_end = DateTime.substring(0, DateTime.lastIndexOf('.'));
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, null);

      return data;
    }
  
    @Get(':countryID')
    async findOneId(@Param('countryID') countryID: String): Promise<Areas> {
      return this.areasService.findOne(countryID);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
      return this.areasService.delete(id);
    }
}

