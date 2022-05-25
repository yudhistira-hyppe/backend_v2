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
          isCertified: true,
          YearcreatedAt: year_param,
        },
      },
      {
        $group: {
          _id: { year_month: { $substrCP: ['$createdAt', 0, 7] } },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          count: 1,
          month_: { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
          month_name_: {
            $arrayElemAt: [
              monthsArray,
              {
                $subtract: [
                  { $toInt: { $substrCP: ['$_id.year_month', 5, 2] } },
                  1,
                ],
              },
            ],
          },
          year_: { $substrCP: ['$_id.year_month', 0, 4] },
        },
      },
      {
        $project: {
          _id: 0,
          month_name: '$month_name_',
          month: '$month_',
          year: { $toInt: '$year_' },
          count: 1,
        },
      },
    ]).exec();
    return GetCount;
  }
}
