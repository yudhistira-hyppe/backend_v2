import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TagCountService } from './tag_count.service';
import { TagCountController } from './tag_count.controller';
import { ConfigModule } from '@nestjs/config';
import { TagCount, TagCountSchema } from './schemas/tag_count.schema';

@Module({

  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: TagCount.name, schema: TagCountSchema }], 'SERVER_FULL')
  ],
  controllers: [TagCountController],
  providers: [TagCountService],
  exports: [TagCountService],
})
export class TagCountModule { }
