import { Controller } from '@nestjs/common';
import { TaskService } from './task.service';
@Controller('api/adroles')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }
}
