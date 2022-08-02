import { Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { UtilsService } from '../../utils/utils.service';
import { UserticketsService } from '../../trans/usertickets/usertickets.service';
import { UserbasicsService } from 'src/trans/userbasics/userbasics.service';
import { CreateUserticketsDto } from 'src/trans/usertickets/dto/create-usertickets.dto';

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const imapConfig = {
  user: process.env.EMAIL_USERNAME_SUPORT,
  password: process.env.EMAIL_PASSWORD_SUPORT,
  host: process.env.EMAIL_HOST_SUPORT,
  port: process.env.EMAIL_PORT_SUPORT,
  tls: true, 
  tlsOptions: { rejectUnauthorized: false }
};
const imap = new Imap(imapConfig);

@Injectable()
export class ScheduleEmailService {
  constructor(
    private utilsService: UtilsService,
    private userticketsService: UserticketsService,
    private userbasicsService: UserbasicsService, 
  ) { }

  private readonly logger = new Logger(ScheduleEmailService.name);

  //@Interval(process.env.TIME_INTERVAL)
  @Cron(process.env.TIME_SECOND + ' ' + process.env.TIME_MINUTES + ' ' + process.env.TIME_HOURS + ' ' + process.env.TIME_DAY_OF_MONTH + ' ' + process.env.TIME_MONTHS + ' ' +process.env.TIME_DAY_OF_WEEK, {
    name: 'email',
    timeZone: process.env.TIMEZONE,
  })
  async EmailRead() {
    var filter = await this.utilsService.getSetting('EmailFilter');
    try {
      var date_param = new Date();
      date_param.setMonth(date_param.getMonth() - 3);
      const imap = new Imap(imapConfig);
      imap.once('ready', () => {
        imap.openBox('INBOX', false, () => {
          imap.search(['UNSEEN', ['HEADER', 'SUBJECT', filter], ['SINCE', date_param]], (err, results) => {
            //Ceck Email Leght
            if (results.length>0){
              const f = imap.fetch(results, { bodies: '' });
              f.on('message', msg => {
                msg.on('body', stream => {
                  simpleParser(stream, async (err, parsed) => {
                    //Ceck User Userbasics
                    const data_userbasics = await this.userbasicsService.findOne(
                      parsed.from.value[0].address,
                    );

                    if (await this.utilsService.ceckData(data_userbasics)) {
                      var datatiket = await this.userticketsService.findAll();
                      var leng = datatiket.length + 1;
                      var curdate = new Date(Date.now());
                      var beforedate = curdate.toISOString();
                      var substrtahun = beforedate.substring(0, 4);
                      var numtahun = parseInt(substrtahun);
                      var substrbulan = beforedate.substring(7, 5);
                      var numbulan = parseInt(substrbulan);
                      var substrtanggal = beforedate.substring(10, 8);
                      var numtanggal = parseInt(substrtanggal);
                      var rotahun = this.utilsService.generateRomawi(numtahun);
                      var robulan = this.utilsService.generateRomawi(numbulan);
                      var rotanggal = this.utilsService.generateRomawi(numtanggal);

                      //Generate tiket number
                      var no = "HYPPE/" + (await rotahun).toString() + "/" + (await robulan).toString() + "/" + (await rotanggal).toString() + "/" + leng;
                      var email_subject = parsed.subject;
                      var email_date = parsed.date;
                      var email_text = parsed.text;
                      var email_address = parsed.from.value[0].address;

                      //Insert user tiket
                      try{
                        var iduser = data_userbasics._id;
                        var CreateUserticketsDto_ = new CreateUserticketsDto();
                        CreateUserticketsDto_.nomortiket = no;
                        CreateUserticketsDto_.subject = email_subject;
                        CreateUserticketsDto_.body = email_text;
                        CreateUserticketsDto_.datetime = email_date.toISOString();
                        CreateUserticketsDto_.IdUser = iduser; 
                        CreateUserticketsDto_.active = true;
                        CreateUserticketsDto_.tipe = 'Troubleshoot';
                        await this.userticketsService.create(CreateUserticketsDto_);
                      } catch (err) {
                        console.log('Failed insert usertiket ' + err);
                      }
                    }

                  });
                });
                msg.once('attributes', attrs => {
                  const { uid } = attrs;
                  imap.addFlags(uid, ['\\Seen'], () => {
                    console.log('Marked as read!');
                  });
                });
              });
              f.once('error', ex => {
                return Promise.reject(ex);
              });
              f.once('end', () => {
                console.log('Done fetching all messages!');
                imap.end();
              });
            } else {
              console.log('Nothing messages!');
            }
          });
        });
      });

      imap.once('error', err => {
        console.log(err);
      });

      imap.once('end', () => {
        console.log('Connection ended');
      });

      imap.connect();
    } catch (ex) {
      console.log('an error occurred');
    }
  }
}
