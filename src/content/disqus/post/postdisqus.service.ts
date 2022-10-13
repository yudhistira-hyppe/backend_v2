import { Injectable, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostResponse, CreatePostsDto, PostResponseApps } from '../../posts/dto/create-posts.dto';
import { Model } from 'mongoose';
import { Posts, PostsDocument } from '../../posts/schemas/posts.schema';
import { GetuserprofilesService } from '../../../trans/getuserprofiles/getuserprofiles.service';

@Injectable()
export class PostDisqusService {
  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
    private getuserprofilesService: GetuserprofilesService,
  ) { }


  async findOnepostID(postID: string): Promise<Object> {
    var datacontent = null;
    var CreatePostsDto_ = await this.PostsModel.findOne({ postID: postID }).exec();
    if (CreatePostsDto_.postType == 'vid') {
      datacontent = 'mediavideos';
    } else if (CreatePostsDto_.postType == 'pict') {
      datacontent = 'mediapicts';
    } else if (CreatePostsDto_.postType == 'diary') {
      datacontent = 'mediadiaries';
    } else if (CreatePostsDto_.postType == 'story') {
      datacontent = 'mediastories';
    }

    //Ceck User Userbasics
    const datauserbasicsService = await this.getuserprofilesService.findUserDetailbyEmail(
      CreatePostsDto_.email.toString()
    );

    const query = await this.PostsModel.aggregate([
      {
        $match: {
          postID: postID
        }
      },
      {
        $lookup: {
          from: datacontent,
          localField: "postID",
          foreignField: "postID",
          as: "datacontent"
        }
      },
    ]);
    Object.assign(query[0], { datauser: datauserbasicsService });
    return query;
  }
}
