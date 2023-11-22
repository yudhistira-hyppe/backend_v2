import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PostContentService } from "src/content/posts/postcontent.service";
import { ChallengeService } from "src/trans/challenge/challenge.service";
import { TransactionsService } from "src/trans/transactions/transactions.service";


@Injectable()
export class TaskService {
  constructor(
    private readonly challengeService: ChallengeService,
    private readonly transactionsService: TransactionsService,
  ) { }


  private readonly logger = new Logger(TaskService.name);

  // @Cron('45 * * * * *')
  // handleCron() {
  //   this.logger.debug('Called when the current second is 45');
  // }

  // @Cron('* */5 * * * *')
  // challengeJob() {
  //   this.logger.debug('Challenge JOB START userbadge');
  //   //this.challengeService.userbadge();
  //   // this.logger.debug('Challenge JOB START updateUserbadge');
  //   this.challengeService.updateBadgeex();
  //   this.challengeService.updateSubchallengeex();
  //   // this.challengeService.sendNotifeChallenge();
  //   //this.postContentService.cronJobSeaweedProfileStart();
  //   //this.postContentService.cronJobSeaweedPictStart();
  //   //this.postContentService.cronJobSeaweedVidStart();
  //   //this.postContentService.cronJobSeaweedDiariesStart();
  // }

  // @Cron('0 */7 * * * *')
  // challengeJob2() {
  //   this.logger.debug('----------Challenge JOB START----------', new Date());
  //   this.challengeService.sendNotifeChallenge();
  //   this.challengeService.updateBadgeex();
  //   this.challengeService.updateSubchallengeex();

  // }

  // @Cron('0 */10 * * * *')
  // ceckStatus() {
  //   this.logger.debug('----------DISBURSEMENT JOB START----------', new Date());
  //   this.transactionsService.ceckStatusDisbursement();
  // }
}
