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
    return this.DisquslogsModel.findOne({ _id: id, active:true }).exec();
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
      { active: false, senderActive: false, receiverActive: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
        });
      return {
        status: true,
        discustId: data_discuslog.disqusID.toString()
      };
    } else {
      return {
        status: false,
        discustId: null
      };
    }
  }

  async finddiscussLogByDiscussID(_id: string): Promise<Disquslogs[]> {
    const data_discuslog = await this.DisquslogsModel.find({ disqusID: _id, active: true }).sort({ createdAt: -1 }).exec();
    return data_discuslog;
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
    let query = this.DisquslogsModel.find({ disqusID: disqusId, active: true }).sort({ sequenceNumber :1});

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

      var dta = [];
      if (dat.sequenceNumber==0){
        dta.push(obj);
      }else{
        var index_default = 0;
        res.map((item, index) => {
          item.filter((item_, index_) =>{
            if (item_.lineID == dat.parentID){
              index_default = index
            }
            return item_.lineID == dat.parentID
          });
        });
        res[index_default].push(obj);
      }
      if (dta.length > 0) {
        res.push(dta)
      }
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
