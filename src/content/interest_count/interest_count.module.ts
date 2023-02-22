import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InterestCountService } from './interest_count.service';
import { InterestCountController } from './interest_count.controller';
import { ConfigModule } from '@nestjs/config';
import { InterestCount, InterestCountSchema } from './schemas/interest_count.schema';

@Module({

  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: InterestCount.name, schema: InterestCountSchema }], 'SERVER_FULL')
  ],
  controllers: [InterestCountController],
  providers: [InterestCountService],
  exports: [InterestCountService],
})
export class InterestCountModule { }