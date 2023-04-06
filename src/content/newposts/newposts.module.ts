

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NewpostsService } from './newposts.service';
import { NewpostsController } from './newposts.controller';
import { ConfigModule } from '@nestjs/config';
import { Newposts, NewpostsSchema } from './schemas/newposts.schema';
@Module({

  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Newposts.name, schema: NewpostsSchema }], 'SERVER_FULL')
  ],
  controllers: [NewpostsController],
  providers: [NewpostsService],
  exports: [NewpostsService],
})
export class NewpostsModule { }
