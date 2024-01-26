import { Controller } from '@nestjs/common';
import { NewPost2Service } from './new_post2.service';

@Controller('api/new-post2')
export class NewPost2Controller {
  constructor(private readonly newPost2Service: NewPost2Service) {}
}
