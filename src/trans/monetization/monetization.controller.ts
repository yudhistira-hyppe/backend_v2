import { Body, Headers, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, HttpStatus, Req, Logger, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { MonetizationService } from './monetization.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('coinThumb'))
  async create(@UploadedFile() file: Express.Multer.File, @Headers() headers, @Body() body) {
    let type = body.type;

    if (type == 'COIN') {
      return this.monetizationService.createCoin(file, body);
    }
    else if (type == 'CREDIT') {
      return this.monetizationService.createCredit(body);
    }
  }

  @Post("/list/coin")
  async listAllCoins(@Req() request: Request, @Headers() headers) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    let skip = (request_json.page > 0 ? (request_json.page - 1) : 0) * request_json.limit;
    return this.monetizationService.listAllCoin(skip, request_json.limit, request_json.descending, request_json.name, request_json.from, request_json.to, request_json.stock_gte, request_json.stock_lte, request_json.status);
  }

  @Post("/deactivate")
  @UseGuards(JwtAuthGuard)
  async deactivate(@Req() request: Request, @Headers() headers) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    return this.monetizationService.deactivate(request_json.id);
  }

  @Post("/delete")
  @UseGuards(JwtAuthGuard)
  async delete(@Req() request: Request, @Headers() headers) {
    var request_json = JSON.parse(JSON.stringify(request.body));
    return this.monetizationService.delete(request_json.id);
  }
}
