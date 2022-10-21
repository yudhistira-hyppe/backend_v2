import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInsightlogsDto } from './dto/create-insightlogs.dto';
import { Insightlogs, InsightlogsDocument } from './schemas/insightlogs.schema';

@Injectable()
export class InsightlogsService {
  constructor(
    @InjectModel(Insightlogs.name, 'SERVER_FULL')
    private readonly InsightlogsModel: Model<InsightlogsDocument>,
  ) { }

  async create(
    CreateInsightlogsDto: CreateInsightlogsDto,
  ): Promise<Insightlogs> {
    const createInsightlogsDto = await this.InsightlogsModel.create(
      CreateInsightlogsDto,
    );
    return createInsightlogsDto;
  }

  async findAll(): Promise<Insightlogs[]> {
    return this.InsightlogsModel.find().exec();
  }

  async findOne(id: string): Promise<Insightlogs> {
    return this.InsightlogsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.InsightlogsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async getlike(email: string) {
    const query = await this.InsightlogsModel.aggregate([
      {
        $addFields: {
          insightID: '$insightID',

        },

      },
      {
        $lookup: {
          from: "insights",
          localField: "insightID",
          foreignField: "insightID",
          as: "activity_data"
        }
      },
      { "$match": { "activity_data.email": email, "eventInsight": "LIKE" } },

      {
        $group: {
          _id: {
            tanggal: {
              $substrCP: [
                "$createdAt",
                0,
                10
              ]
            }
          },
          like: {
            $sum: 1
          },
          "tables": { "$push": "$activity_data" },
        }
      }, {
        $project: {

          date: "$_id.tanggal",
          like: 1,
          activity: { $arrayElemAt: ['$tables', 0] },
          totalLikes: "$activity.likes"

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          like: 1,

          totalLikes: "$activity.likes"

        }
      }, {
        $sort: {
          date: - 1
        }
      }, {
        $limit: 2
      },
    ]).exec();

    return query;
  }

  async getfollowers(email: string) {
    const query = await this.InsightlogsModel.aggregate([
      {
        $addFields: {
          insightID: '$insightID',

        },

      },
      {
        $lookup: {
          from: "insights",
          localField: "insightID",
          foreignField: "insightID",
          as: "activity_data"
        }
      },
      { "$match": { "activity_data.email": email, "eventInsight": "FOLLOWER" } },

      {
        $group: {
          _id: {
            tanggal: {
              $substrCP: [
                "$createdAt",
                0,
                10
              ]
            }
          },
          followers: {
            $sum: 1
          },
          "tables": { "$push": "$activity_data" },
        }
      }, {
        $project: {

          date: "$_id.tanggal",
          followers: 1,
          activity: { $arrayElemAt: ['$tables', 0] },
          totalFollowers: "$activity.followers"

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          followers: 1,

          totalFollowers: "$activity.followers"

        }
      }, {
        $sort: {
          date: - 1
        }
      }, {
        $limit: 2
      },
    ]).exec();

    return query;
  }

  async getfollowing(email: string) {
    const query = await this.InsightlogsModel.aggregate([
      {
        $addFields: {
          insightID: '$insightID',

        },

      },
      {
        $lookup: {
          from: "insights",
          localField: "insightID",
          foreignField: "insightID",
          as: "activity_data"
        }
      },
      { "$match": { "activity_data.email": email, "eventInsight": "FOLLOWING" } },

      {
        $group: {
          _id: {
            tanggal: {
              $substrCP: [
                "$createdAt",
                0,
                10
              ]
            }
          },
          followings: {
            $sum: 1
          },
          "tables": { "$push": "$activity_data" },
        }
      }, {
        $project: {

          date: "$_id.tanggal",
          followings: 1,
          activity: { $arrayElemAt: ['$tables', 0] },
          totalFollowing: "$activity.followings"

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          followings: 1,

          totalFollowing: "$activity.followings"

        }
      }, {
        $sort: {
          date: - 1
        }
      }, {
        $limit: 2
      },
    ]).exec();

    return query;
  }

  async getview1(email: string, date: string) {

    var currentdate = new Date(new Date(date).setDate(new Date(date).getDate() + 1));
    var currdate1 = currentdate.toISOString();
    var sbustdate1 = currdate1.substring(0, 10);
    var currentdateweek1 = new Date(new Date(date).setDate(new Date(date).getDate() - 7));
    var curreweek1 = currentdateweek1.toISOString();
    var sbustrweek1 = curreweek1.substring(0, 10);

    const query = await this.InsightlogsModel.aggregate([
      { "$match": { "mate": email, "eventInsight": "VIEW", "createdAt": { $gte: sbustrweek1, $lte: sbustdate1 } } },

      {
        $group: {
          _id: null,
          views: {
            $sum: 1
          },

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          views: 1,

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          views: 1,


        }
      }, {
        $sort: {
          date: - 1
        }
      },
    ]).exec();

    return query;
  }

  async getview2(email: string, date: string) {

    var currentdate = new Date(new Date(date).setDate(new Date(date).getDate() - 7));
    var currdate1 = currentdate.toISOString();
    var sbustdate1 = currdate1.substring(0, 10);
    var currentdateweek1 = new Date(new Date(date).setDate(new Date(date).getDate() - 14));
    var curreweek1 = currentdateweek1.toISOString();
    var sbustrweek1 = curreweek1.substring(0, 10);

    const query = await this.InsightlogsModel.aggregate([
      { "$match": { "mate": email, "eventInsight": "VIEW", "createdAt": { $gte: sbustrweek1, $lte: sbustdate1 } } },

      {
        $group: {
          _id: null,
          views: {
            $sum: 1
          },

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          views: 1,

        }
      }, {
        $project: {

          date: "$_id.tanggal",
          views: 1,


        }
      }, {
        $sort: {
          date: - 1
        }
      },
    ]).exec();

    return query;
  }

  async getviewall(email: string) {
    const query = await this.InsightlogsModel.aggregate([
      { "$match": { "mate": email, "eventInsight": "VIEW" } },
    ]).exec();

    return query;
  }
}
