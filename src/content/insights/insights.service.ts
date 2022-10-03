import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInsightsDto } from './dto/create-insights.dto';
import { Insights, InsightsDocument } from './schemas/insights.schema';


@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(Insights.name, 'SERVER_CONTENT')
    private readonly InsightsModel: Model<InsightsDocument>,
  ) { }

  async create(CreateInsightsDto: CreateInsightsDto): Promise<Insights> {
    const createInsightsDto = await this.InsightsModel.create(
      CreateInsightsDto,
    );
    return createInsightsDto;
  }

  async updateNoneActive(email: string) {
    this.InsightsModel.updateMany(
      {
        email: email,
      },
      {
        $set: {
          "active": false,
          "email": email + '_noneactive'
        }
      },
      function (err, docs) {
        if (err) {
          //console.log(err);
        } else {
          //console.log(docs);
        }
      },
    );
  }

  async findAll(): Promise<Insights[]> {
    return this.InsightsModel.find().exec();
  }

  async findemail(email: string): Promise<Insights> {
    return this.InsightsModel.findOne({ email: email }).exec();
  }

  async updatesalelike(id: string, like: number): Promise<Object> {
    let data = await this.InsightsModel.updateOne({ "_id": id },
      {
        $set: {
          "likes": like
        }
      });
    return data;
  }

  async updatesaleview(id: string, view: number): Promise<Object> {
    let data = await this.InsightsModel.updateOne({ "_id": id },
      {
        $set: {
          "views": view
        }
      });
    return data;
  }
  async findOne(_id: string): Promise<Insights> {
    return this.InsightsModel.findOne({ _id: _id }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.InsightsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async Engagement(year: number): Promise<Object> {
    var currentTime = new Date();
    var year_param = 0;
    if (year != undefined) {
      year_param = year;
    } else {
      year_param = currentTime.getFullYear();
    }
    const monthsArray = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var GetCount = this.InsightsModel.aggregate([
      {
        $project: {
          views_repo: '$views',
          likes_repo: '$likes',
          shares_repo: '$shares',
          reactions_repo: '$reactions',
          month_repo: { $toInt: { $substrCP: ['$createdAt', 5, 2] } },
          month_name_repo: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$createdAt', 5, 2] } }, 1],
              },
            ],
          },
          YearcreatedAt_repo: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param_repo: { $toInt: year_param.toString() },
        },
      },
      {
        $group: {
          _id: {
            month_group: '$month_repo',
          },
          views_repo_sum: { $sum: '$views_repo' },
          likes_repo_sum: { $sum: '$likes_repo' },
          shares_repo_sum: { $sum: '$shares_repo' },
          reactions_repo_sum: { $sum: '$reactions_repo' },
        },
      },
      {
        $sort: { '_id.month_group': 1 },
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month_group',
          month_name: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: ['$_id.month_group', 1],
              },
            ],
          },
          views: '$views_repo_sum',
          likes: '$likes_repo_sum',
          shares: '$shares_repo_sum',
          reactions: '$reactions_repo_sum',
        },
      },
      // {
      //   $group: {
      //     _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
      //     count: { $sum: 1 },
      //   },
      // },
    ]).exec();
    return GetCount;
  }

  async findinsight() {
    const query = await this.InsightsModel.aggregate([

      {
        $lookup: {
          from: 'insights',
          localField: 'insights.$id',
          foreignField: '_id',
          as: 'roless',
        },
      }, {
        $out: {
          db: 'hyppe_trans_db',
          coll: 'insights2'
        }
      },

    ]);
    return query;
  }

  async getinsight(email: string) {
    const query = await this.InsightsModel.aggregate([


      { "$match": { "email": email } },
    ]).exec();

    return query;
  }

  async updateViewProfile(emailViewed: string){
    this.InsightsModel.updateOne(
      {
        email: emailViewed,
      },
      { $inc: { views_profile: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async getInteractivesQuery(emailViewed: string) {
    let Query = this.InsightsModel
  }

}
