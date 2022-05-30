import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePostsDto } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';


@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Posts.name) private readonly PostsModel: Model<PostsDocument>,
  ) {}

  async create(CreatePostsDto: CreatePostsDto): Promise<Posts> {
    const createPostsDto = await this.PostsModel.create(CreatePostsDto);
    return createPostsDto;
  }

  async findAll(): Promise<Posts[]> {
    return this.PostsModel.find().exec();
  }

  //    async findOne(id: string): Promise<Posts> {
  //     return this.PostsModel.findOne({ _id: id }).exec();
  //   }
  async findOne(email: string): Promise<Posts> {
    return this.PostsModel.findOne({ email: email }).exec();
  }
  async delete(id: string) {
    const deletedCat = await this.PostsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCat;
  }

  async MonetizeByYear(year: number): Promise<Object> {
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
    var GetCount = this.PostsModel.aggregate([
      {
        $sort: { createdAt: 1 },
      },
      {
        $project: {
          isCertified: '$isCertified',
          createdAt: '$createdAt',
          YearcreatedAt: { $toInt: { $substrCP: ['$createdAt', 0, 4] } },
          year_param: { $toInt: year_param.toString() },
        },
      },
      {
        $match: {
          isCertified: { $ne: null },
          YearcreatedAt: year_param,
        },
      },
      {
        $group: {
          _id: {
            year_month: { $substrCP: ['$createdAt', 0, 7] },
            isCertified_data: '$isCertified',
          },
          isCertified_data_count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.year_month',
          log: {
            $push: {
              isCertified_data: '$_id.isCertified_data',
              isCertified_data_count_: '$isCertified_data_count',
            },
          },
          count: { $sum: '$isCertified_data_count' },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_int: { $toInt: { $substrCP: ['$_id', 5, 2] } },
          month_: { $substrCP: ['$_id', 5, 2] },
          monet: '$log',
          month_name_: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [{ $toInt: { $substrCP: ['$_id', 5, 2] } }, 1],
              },
            ],
          },
          year_: { $substrCP: ['$_id', 0, 4] },
        },
      },
      {
        $sort: { month_int: 1 },
      },
      {
        $project: {
          _id: 0,
          month_name: '$month_name_',
          month: '$month_',
          year: { $toInt: '$year_' },
          monitize: '$monet',
          count_all: { $sum: '$monet.isCertified_data_count_' },
        },
      },
    ]).exec();
    return GetCount;
  }
}
