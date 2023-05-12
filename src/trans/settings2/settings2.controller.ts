import { Settings2Service } from './settings2.service';
import { Body, Controller, Delete, Get, Param, Post, Put, Res, Request, UseGuards, HttpStatus, Req } from '@nestjs/common';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { Settings } from './schemas/settings.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/settings2')
export class Settings2Controller {
  constructor(private readonly settings2Service: Settings2Service) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Settings[]> {
      return this.settings2Service.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() CreateSettingsDto: CreateSettingsDto) {
      const messages = {
          "info": ["The process successful"],
      };
      var data = await this.settings2Service.create(CreateSettingsDto);
      return { response_code: 202, data, messages };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateid(@Res() res, @Param('id') id: string, @Body() CreateSettingsDto: CreateSettingsDto, @Request() request) {
      const messages = {
          "info": ["The update successful"],
      };

      const messagesEror = {
          "info": ["Todo is not found!"],
      };

      try {


          let data = await this.settings2Service.update(id, CreateSettingsDto);
          return res.status(HttpStatus.OK).json({
              response_code: 202,
              "data": data,
              "message": messages
          });
      } catch (e) {
          return res.status(HttpStatus.BAD_REQUEST).json({

              "message": messagesEror
          });
      }
  }
}
