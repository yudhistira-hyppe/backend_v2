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

  @Cron('0 */7 * * * *')
  challengeJob2() {
    // this.logger.debug('----------Challenge JOB START----------', new Date());
    // this.challengeService.sendNotifeChallenge();
    // this.challengeService.updateBadgeex();
    // this.challengeService.updateSubchallengeex();

  }

  @Cron('0 */10 * * * *')
  ceckStatus() {
    //this.logger.debug('----------DISBURSEMENT JOB START----------', new Date());
    //this.transactionsService.ceckStatusDisbursement();
  }
}
