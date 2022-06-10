import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, BadRequestException, Res, HttpStatus } from '@nestjs/common';
import { DisquslogsService } from './disquslogs.service';
import { CreateDisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs } from './schemas/disquslogs.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Request } from 'express';
@Controller('api/disquslogs')
export class DisquslogsController {
  constructor(private readonly DisquslogsService: DisquslogsService) { }

  @Post()
  async create(@Body() CreateDisquslogsDto: CreateDisquslogsDto) {
    await this.DisquslogsService.create(CreateDisquslogsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsService.findAll();
  }

  @Get(':id')
  async findOneId(@Param('id') id: string): Promise<Disquslogs> {
    return this.DisquslogsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.DisquslogsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Res() res, @Param('id') id: string, @Body() createDisquslogsDto: CreateDisquslogsDto) {

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };

    try {
      let data = await this.DisquslogsService.update(id, createDisquslogsDto);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "data": data,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }
}
