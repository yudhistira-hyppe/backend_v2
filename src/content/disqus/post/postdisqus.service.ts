import { Injectable, Logger, NotAcceptableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, CreatePostResponse, CreatePostsDto, ImageInfo, PostResponseApps, VideoList } from '../../posts/dto/create-posts.dto';
import { Model } from 'mongoose';
import { Posts, PostsDocument } from '../../posts/schemas/posts.schema';
import { GetuserprofilesService } from '../../../trans/getuserprofiles/getuserprofiles.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostDisqusService {
  private readonly logger = new Logger(PostDisqusService.name);
  constructor(
    @InjectModel(Posts.name, 'SERVER_FULL')
    private readonly PostsModel: Model<PostsDocument>,
    private getuserprofilesService: GetuserprofilesService,
    private readonly configService: ConfigService,
  ) { }

  async findByPostId(postID: string): Promise<Posts> {
    return this.PostsModel.findOne({ postID: postID }).exec();
  }

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

  async findOnepostID3(post: Posts): Promise<Object> {
    var datacontent = null;
    if (post.postType == 'vid') {
      datacontent = 'mediavideos';
    } else if (post.postType == 'pict') {
      datacontent = 'mediapicts';
    } else if (post.postType == 'diary') {
      datacontent = 'mediadiaries';
    } else if (post.postType == 'story') {
      datacontent = 'mediastories';
    }

    const query = await this.PostsModel.aggregate([
      {
        $match: {
          postID: post.postID
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
    return query;
  }

  async updateCommentPlus(postID: string) {
    this.PostsModel.updateOne(
      {
        postID: postID,
      },
      { $inc: { comments: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async findOnepostID2(postID: string): Promise<Object> {
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
    return query;
  }

  async findContentPost(postID: string): Promise<Posts> {
    return await this.PostsModel.findOne({ postID: postID }).exec();
  }

  async findid(id: string): Promise<Posts> {
    return this.PostsModel.findOne({ _id: id }).exec();
  }

  async updateView(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { views: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateLike(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { likes: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateReaction(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { reactions: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async updateUnLike(email: string, postID: string) {
    this.PostsModel.updateOne(
      {
        email: email,
        postID: postID,
      },
      { $inc: { likes: -1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async getImageApsara(ids: String[]): Promise<ApsaraImageResponse> {
    let san: String[] = [];
    for (let i = 0; i < ids.length; i++) {
      let obj = ids[i];
      if (obj != undefined && obj != 'undefined') {
        san.push(obj);
      }
    }

    let tx = new ApsaraImageResponse();
    let vl: ImageInfo[] = [];
    let chunk = this.chunkify(san, 15);
    for (let i = 0; i < chunk.length; i++) {
      let c = chunk[i];

      let vids = c.join(',');
      //this.logger.log("getImageApsara >>> video id: " + vids);
      var RPCClient = require('@alicloud/pop-core').RPCClient;

      let client = new RPCClient({
        accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
        accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
        endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
        apiVersion: '2017-03-21'
      });

      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "ImageIds": vids
      }

      let requestOption = {
        method: 'POST'
      };

      let dto = new ApsaraImageResponse();
      let result = await client.request('GetImageInfos', params, requestOption);
      let ty: ApsaraImageResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));

      if (ty.ImageInfo.length > 0) {
        for (let x = 0; x < ty.ImageInfo.length; x++) {
          let vv = ty.ImageInfo[x];
          vl.push(vv);
        }
      }
    }
    tx.ImageInfo = vl;
    return tx;
  }

  public async getVideoApsara(ids: String[]): Promise<ApsaraVideoResponse> {
    let san: String[] = [];
    for (let i = 0; i < ids.length; i++) {
      let obj = ids[i];
      if (obj != undefined && obj != 'undefined') {
        san.push(obj);
      }
    }

    let tx = new ApsaraVideoResponse();
    let vl: VideoList[] = [];
    let chunk = this.chunkify(san, 15);
    for (let i = 0; i < chunk.length; i++) {
      let c = chunk[i];

      let vids = c.join(',');
      this.logger.log("getVideoApsara >>> video id: " + vids);
      var RPCClient = require('@alicloud/pop-core').RPCClient;

      let client = new RPCClient({
        accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
        accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
        endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
        apiVersion: '2017-03-21'
      });

      let params = {
        "RegionId": this.configService.get("APSARA_REGION_ID"),
        "VideoIds": vids
      }

      let requestOption = {
        method: 'POST'
      };

      let dto = new ApsaraVideoResponse();
      let result = await client.request('GetVideoInfos', params, requestOption);
      let ty: ApsaraVideoResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
      if (ty.VideoList.length > 0) {
        for (let x = 0; x < ty.VideoList.length; x++) {
          let vv = ty.VideoList[x];
          vl.push(vv);
        }
      }

    }
    tx.VideoList = vl;

    return tx;
  }

  private chunkify(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }
}
