import { Module } from '@nestjs/common';
import { MonetizationService } from './monetization.service';
import { MonetizationController } from './monetization.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { LogapisModule } from 'src/trans/logapis/logapis.module';
import { Monetize, monetizeSchema } from './schemas/monetization.schema';

@Module({
  imports: [
    LogapisModule,
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name:Monetize.name, schema: monetizeSchema }], 'SERVER_FULL')
  ],
  controllers: [MonetizationController],
  providers: [MonetizationService]
})
export class MonetizationModule {}
