import { Module } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { Monetize, monetizeSchema } from './schemas/monetization.schema';
import { PostsModule } from 'src/content/posts/posts.module';
import { UtilsModule } from 'src/utils/utils.module';

@Module({
  imports: [
    LogapisModule, PostsModule, UtilsModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: Monetize.name, schema: monetizeSchema }], 'SERVER_FULL')
  ],
  controllers: [MonetizationController],
  providers: [MonetizationService]
})
export class MonetizationModule { }
