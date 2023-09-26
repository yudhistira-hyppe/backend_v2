import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateNewPostDTO } from './dto/create-newPost.dto';
import { NewpostsSchema } from './schemas/newPost.schema';

@Controller('api/post/v2')
export class NewPostController {
  constructor(private readonly newPostService: NewPostService) { }
}
