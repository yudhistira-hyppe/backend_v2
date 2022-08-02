import { Controller } from '@nestjs/common';
import { ScheduleEmailService } from './scheduleemail.service';
@Controller('api/adroles')
export class ScheduleEmailController {
  constructor(private readonly scheduleEmailService: ScheduleEmailService) { }
}
