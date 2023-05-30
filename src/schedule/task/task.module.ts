
import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { ScheduleModule } from '@nestjs/schedule';
import { UtilsModule } from '../../utils/utils.module';
import { UserticketsModule } from '../../trans/usertickets/usertickets.module';
import { UserbasicsModule } from '../../trans/userbasics/userbasics.module';

@Module({
  imports: [
      ScheduleModule.forRoot()
    ],
  controllers: [TaskController],
  providers: [TaskService]
})
export class TaskModule {}
