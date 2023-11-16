import { Controller, Get, Param } from '@nestjs/common';
import { NewNotificationService } from './newnotification.service';

@Controller('newnotification')
export class NewNotificationController {
  constructor(private readonly newnotificationService: NewNotificationService) {}
}
