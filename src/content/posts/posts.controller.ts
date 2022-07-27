import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  Req,
  Request,
  BadRequestException, HttpStatus, Put, Res
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-posts.dto';
import { Posts } from './schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly PostsService: PostsService) { }

  @Post()
  async create(@Body() CreatePostsDto: CreatePostsDto) {
    await this.PostsService.create(CreatePostsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Posts[]> {
    return this.PostsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/regcontens')
  async regContent(): Promise<Object> {
    return this.PostsService.regcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/newcontens')
  async newContent(): Promise<Object> {
    return this.PostsService.newcontenMonetize();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/getcontent/')
  async getContent(@Req() req): Promise<Object> {
    var email = req.body.email;
    var type = req.body.type;
    var type_ = "all";
    if (email == undefined) {
      throw new BadRequestException('Unabled to proceed');
    }
    if (type != undefined) {
      type_ = type;
    }
    return this.PostsService.getContent(email, type_);
  }

  // @Get(':id')
  // async findOneId(@Param('id') id: string): Promise<Posts> {
  //   return this.PostsService.findOne(id);
  // }

  @Get(':email')
  async findOneId(@Param('email') email: string): Promise<Posts> {
    return this.PostsService.findOne(email);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.PostsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('monetizebyyear')
  async countPost(@Body('year') year: number): Promise<Object> {
    return this.PostsService.MonetizeByYear(year);
  }

  @UseGuards(JwtAuthGuard)
  @Put('update/:id')
  async update(@Res() res, @Param('id') id: string, @Req() request: Request) {
    var saleAmount = 0;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["saleAmount"] !== undefined) {
      saleAmount = request_json["saleAmount"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {
      let data = await this.PostsService.updateprice(id, saleAmount);
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

  @UseGuards(JwtAuthGuard)
  @Put('update/:id/:email')
  async updateTag(@Res() res, @Param('id') id: string, @Param('email') email: string, @Req() request: Request) {
    var tags = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["tags"] !== undefined) {
      tags = request_json["tags"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    const messages = {
      "info": ["The update successful"],
    };

    const messagesEror = {
      "info": ["Todo is not found!"],
    };
    try {
      let data = await this.PostsService.updateTag(id, tags, email);
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
