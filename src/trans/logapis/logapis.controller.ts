import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LogapisService } from './logapis.service';
import { CreateLogapiDto } from './dto/create-logapi.dto';

@Controller('api/logapis')
export class LogapisController {
  constructor(private readonly logapisService: LogapisService) {}

  // @Post()
  // create(@Body() createLogapiDto: CreateLogapiDto) {
  //   return this.logapisService.create(createLogapiDto);
  // }

  @Get()
  findAll() {
    return this.logapisService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.logapisService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateLogapiDto: CreateLogapiDto) {
  //   return this.logapisService.update(+id, updateLogapiDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.logapisService.remove(+id);
  // }
}
