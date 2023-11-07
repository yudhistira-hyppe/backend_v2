import { Body, Controller, HttpCode, Headers, Get, Param, HttpStatus, Post, UseGuards, Logger, Query, Patch, Res, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'; 
import { NewRefferalService } from './newRefferal.service';
import { CreateNewRefferalDto } from './dto/create-newRefferal.dto';
import { UpdateNewRefferalDto } from './dto/update-newRefferal.dto';

@Controller('api')
export class NewRefferalController {
  constructor(private readonly newRefferalService: NewRefferalService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createNewRefferalDto: CreateNewRefferalDto) {
    return this.newRefferalService.create(createNewRefferalDto);
  }

  @Get('/referral/all')
  async findAll() {
    var data = await this.newRefferalService.findAll();
    return {
      response_code:202,
      data:data
    }
  }

  @Get('/referral/:id')
  async findOne(@Param('id') id: string) {
    var data = await this.newRefferalService.findOne(id);
    return {
      response_code:202,
      data:data
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateNewRefferalDto: UpdateNewRefferalDto) {
    return this.newRefferalService.update(+id, updateNewRefferalDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.newRefferalService.remove(+id);
  // }
}
