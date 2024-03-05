import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MonetizationService } from './monetization.service';

@Controller('api/monetization')
export class MonetizationController {
  constructor(
    private readonly monetizationService: MonetizationService
  ) { }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.monetizationService.findOne(id);
  }

  @Get()
  async index() {
    return this.monetizationService.find();
  }

  @Post("/create")
  @UseInterceptors(FileInterceptor('coinThumb'))
  async createn(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
    let type = body.type;

    if (type == 'COIN') {
      return this.monetizationService.createCoin(file, body);
    }
  }
}
