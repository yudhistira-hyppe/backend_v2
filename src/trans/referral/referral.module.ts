
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReferralController } from './referral.controller';
import { ReferralService } from './referral.service';
import { ConfigModule } from '@nestjs/config';
import { Referral,ReferralSchema } from './schemas/referral.schema'; 

@Module({
  imports: [
      ConfigModule.forRoot(),
      MongooseModule.forFeature([{ name: Referral.name, schema: ReferralSchema }],'SERVER_TRANS')
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
  exports: [ReferralService],
})
export class ReferralModule {}