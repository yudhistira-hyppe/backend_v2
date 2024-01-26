import { Module } from '@nestjs/common';
import { NewPost2Service } from './new_post2.service';
import { NewPost2Controller } from './new_post2.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { newPosts2, Newposts2Schema } from './schemas/newPost.schema';
import { UtilsModule } from 'src/utils/utils.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:newPosts2.name, schema:Newposts2Schema }], 'SERVER_FULL')
  ],
  controllers: [NewPost2Controller],
  providers: [NewPost2Service],
  exports: [NewPost2Service]
})
export class NewPost2Module {}
