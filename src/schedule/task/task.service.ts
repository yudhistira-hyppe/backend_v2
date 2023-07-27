import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PostContentService } from "src/content/posts/postcontent.service";


@Injectable()
export class TaskService {
  constructor(
    private readonly postContentService: PostContentService,
  ) { }


  private readonly logger = new Logger(TaskService.name);

  // @Cron('45 * * * * *')
  // handleCron() {
  //   this.logger.debug('Called when the current second is 45');
  // }

  @Cron('0 0 23 * * *')
  seaweedJob() {
    this.logger.debug('SEAWEED JOB START');
    //this.postContentService.cronJobSeaweedProfileStart();
    //this.postContentService.cronJobSeaweedPictStart();
    //this.postContentService.cronJobSeaweedVidStart();
    //this.postContentService.cronJobSeaweedDiariesStart();
  }
}
