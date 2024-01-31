import { Controller, Get, Param, Res } from '@nestjs/common';
import { AppService } from './app.service';
import * as fs from 'fs';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('images/:id')
  async downloadFile(
    @Param('id') id: string, @Res() response) {
    const mime = require('mime-types')
    const pathUpload = "../../images/";
    const mime_type = mime.lookup(pathUpload + id)
    var file = fs.createReadStream(pathUpload + id);
    var stat = fs.statSync(pathUpload + id);
    response.setHeader('Content-Length', stat.size);
    response.setHeader('Content-Type', mime_type);
    response.setHeader('Content-Disposition', 'attachment; filename=' + id);
    file.pipe(response);
  }
}
