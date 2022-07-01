import { Body, Controller, Delete, Get, Param, Post, UseGuards, Put, Res, HttpStatus, Response, Request, Req, BadRequestException } from '@nestjs/common';
import { UserauthsService } from './userauths.service';
import { CreateUserauthDto } from './dto/create-userauth.dto';
import { Userauth } from './schemas/userauth.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
@Controller('api/userauths')
export class UserauthsController {
  constructor(private readonly userauthsService: UserauthsService) { }

  @Post()
  async create(@Body() CreateUserauthDto: CreateUserauthDto) {
    await this.userauthsService.create(CreateUserauthDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Userauth[]> {
    return this.userauthsService.findAll();
  }

  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(id);
  // }
  // @Get(':username')
  // async findOne(@Param('username') username: string): Promise<Userauth> {
  //   return this.userauthsService.findOne(username);
  // }
  @Get(':email')
  async findOne(@Param('email') email: string): Promise<Userauth> {
    return this.userauthsService.findOne(email);
  }
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userauthsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':email')
  async update(@Res() res, @Param('email') email: string, @Req() request: Request) {

    var roles = null;
    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["roles"] !== undefined) {
      roles = request_json["roles"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    try {
      await this.userauthsService.update(email, roles);
      res.status(HttpStatus.OK).json({
        response_code: 202,
        "message": messages
      });
    } catch (e) {
      res.status(HttpStatus.BAD_REQUEST).json({

        "message": messagesEror
      });
    }
  }


}
