import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDisquslogsDto, DisquslogsDto } from './dto/create-disquslogs.dto';
import { Disquslogs, DisquslogsDocument } from './schemas/disquslogs.schema';
import { UtilsService } from '../../utils/utils.service';
import { ErrorHandler } from '../../utils/error.handler';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';

@Injectable()
export class DisquslogsService {
  constructor(
    @InjectModel(Disquslogs.name, 'SERVER_FULL')
    private readonly DisquslogsModel: Model<DisquslogsDocument>,
    private utilsService: UtilsService,
    private userService: UserbasicsService,
    private errorHandler: ErrorHandler,
  ) { }

  async create(CreateDisquslogsDto: CreateDisquslogsDto): Promise<Disquslogs> {
    const createDisquslogsDto = await this.DisquslogsModel.create(
      CreateDisquslogsDto,
    );
    return createDisquslogsDto;
  }

  async findAll(): Promise<Disquslogs[]> {
    return this.DisquslogsModel.find().exec();
  }

  async findOne(id: string): Promise<Disquslogs> {
    return this.DisquslogsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.DisquslogsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  // async increaseReaction(): Promise<Disquslogs>{
  //   InsightLog item = this.getInsightReceiver().get().increaseReaction(this.getProfile().getEmail(), this.getContentPost().get().getPostID());
  //   if (item != null) {
  //     this.getContentPost().get().increaseReaction();
  //     this.getReceiverEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
  //     this.getEventId().get().getParent().setReactionUri(this.getContentDto().getReactionUri());
  //   }
  //   return Optional.ofNullable(item);
  // }

  async finddisquslog() {
    const query = await this.DisquslogsModel.aggregate([

          {
            $lookup: {
              from: 'disquslogs',
              localField: 'disquslogs.$id',
              foreignField: '_id',
              as: 'roless',
            },
          }, {
            $out: {
              db: 'hyppe_trans_db',
              coll: 'disquslogs2'
            }
          },

        ]);
        return query;
      }

      async update(
        id: string,
        createDisquslogsDto: CreateDisquslogsDto,
      ): Promise < Disquslogs > {
        let data = await this.DisquslogsModel.findByIdAndUpdate(
          id,
          createDisquslogsDto,
          { new: true },
        );

        if(!data) {
          throw new Error('Todo is not found!');
        }
    return data;
      }

  async deletedicusslog(request: any): Promise < any > {
        const data_discuslog = await this.DisquslogsModel.findOne({ _id: request._id }).exec();
        if(await this.utilsService.ceckData(data_discuslog)) {
          this.DisquslogsModel.updateOne(
            { _id: request._id },
            { active: false },
            function (err, docs) {
              if (err) {
                console.log(err);
              } else {
                console.log(docs);
              }
            });

    return {
      response_code: 202,
      messages: {
        info: ['Delete Disqus successful'],
      }
    }
  } else {
  throw new NotAcceptableException({
    response_code: 406,
    messages: {
      info: ['Unabled to proceed, Disquslog not found'],
    },
  });
}
  }

  async updateBydiscusid(disqusID: string, email: string) {
  if (disqusID != undefined) {
    this.DisquslogsModel.updateMany(
      {
        disqusID: disqusID,
        sender: email
      },
      { receiverActive: false }, function (err, docs) {
        if (err) {
          console.log('err' + err);
        } else {
          console.log('docs' + docs);
        }
      });
    this.DisquslogsModel.updateMany(
      {
        disqusID: disqusID,
        receiver: email
      },
      { senderActive: false }, function (err, docs) {
        if (err) {
          console.log('err' + err);
        } else {
          console.log('docs' + docs);
        }
      });
  }
  }

  async findDisqusLogByParentID(_id: string): Promise<Disquslogs>{
    return this.DisquslogsModel.findOne({ _id: _id, active: true }).exec();
  }

  async findLogByDisqusId(disqusId: string, dpage: number, dpageRow: number) {
    let query = this.DisquslogsModel.find({ disqusID: disqusId, active: true });

    let row = 20;
    let page = 0;
    if (dpage != undefined) {
      page = dpage;
    }
    if (dpageRow != undefined) {
      row = dpageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'createdAt': -1 });

    //let res: DisquslogsDto[][] = [];
    var res =[];
    let dt = await query.exec();
    for (let i = 0; i < dt.length; i++) {
      let dat = dt[i];
      let obj = new DisquslogsDto();
      obj.sequenceNumber = dat.sequenceNumber;
      obj.createdAt = dat.createdAt;
      obj.txtMessages = dat.txtMessages;
      var profile = await this.utilsService.generateProfile(String(dat.sender), 'PROFILE');
      
      var profile_info = {};
      if (profile.fullName != undefined) {
        profile_info["fullName"] = profile.fullName;
      }
      if (profile.username != undefined) {
        profile_info["username"] = profile.username;
      }
      if (profile.avatar != undefined) {
        profile_info["avatar"] = profile.avatar;
      }
      obj.senderInfo = profile_info;
      obj.receiver = dat.receiver;
      obj.sender = dat.sender;
      obj.lineID = dat._id;
      obj.active = dat.active;
      obj.updatedAt = dat.updatedAt;
      
      var replyLogs_ = dat.replyLogs;
      if (replyLogs_.length > 0) {
        var dta = [];
        dta.push(obj);
        for (var k = 0; k < replyLogs_.length; k++) {
          console.log(replyLogs_[k]);
          var Data_id = JSON.parse(JSON.stringify(replyLogs_[k])).$id.toString();
          var child_replyLogs = await this.findOne(Data_id.toString());

          let objchild = new DisquslogsDto();
          objchild.sequenceNumber = child_replyLogs.sequenceNumber;
          objchild.createdAt = child_replyLogs.createdAt;
          objchild.txtMessages = child_replyLogs.txtMessages;
          var profilehild = await this.utilsService.generateProfile(String(child_replyLogs.sender), 'PROFILE');

          var profile_info_child = {};
          if (profilehild.fullName != undefined) {
            profile_info_child["fullName"] = profilehild.fullName;
          }
          if (profilehild.username != undefined) {
            profile_info_child["username"] = profilehild.username;
          }
          if (profilehild.avatar != undefined) {
            profile_info_child["avatar"] = profilehild.avatar;
          }
          objchild.senderInfo = profile_info_child;
          objchild.receiver = child_replyLogs.receiver;
          objchild.sender = child_replyLogs.sender;
          objchild.lineID = child_replyLogs._id;
          objchild.active = child_replyLogs.active;
          objchild.updatedAt = child_replyLogs.updatedAt;

          dta.push(objchild);
        }
        res.push(dta);
      } else {
        res.push([obj]);
      }
      //res.push(obj);
    }

    return res;
  }

  async flattenDisqus(log: Disquslogs, res: DisquslogsDto[]) {
    let rl = log.replyLogs;
    if (rl != undefined) {
      
    }
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }  

}
