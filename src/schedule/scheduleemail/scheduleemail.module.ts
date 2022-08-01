
import { Module } from '@nestjs/common';
import { ScheduleEmailController } from './scheduleemail.controller';
import { ScheduleEmailService } from './scheduleemail.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from '../../utils/utils.module';
import { UserticketsModule } from '../../trans/usertickets/usertickets.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';

@Module({
  imports: [
      UserbasicsModule,
      UserticketsModule,
      UtilsModule,
      ScheduleModule.forRoot()
    ],
  controllers: [ScheduleEmailController],
  providers: [ScheduleEmailService]
})
export class ScheduleEmailModule {}
