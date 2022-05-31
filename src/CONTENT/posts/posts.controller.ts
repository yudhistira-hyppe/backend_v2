import { Body, Controller, Delete, Get, Param, Post,UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostsDto } from './dto/create-posts.dto';
import { Posts } from './schemas/posts.schema';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly PostsService: PostsService) {}

  @Post()
  async create(@Body() CreatePostsDto: CreatePostsDto) {
    await this.PostsService.create(CreatePostsDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(): Promise<Posts[]> {
    return this.PostsService.findAll();
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
}
