import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { CreateUserplaylistDto } from './dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from './schemas/userplaylist.schema';
import { ErrorHandler } from '../../utils/error.handler';
import { UtilsService } from '../../utils/utils.service';
import { MediadiariesService } from '../../content/mediadiaries/mediadiaries.service';
import { MediastoriesService } from '../../content/mediastories/mediastories.service';
import { MediavideosService } from '../../content/mediavideos/mediavideos.service';
import { MediapictsService } from '../../content/mediapicts/mediapicts.service';
import { UserbasicsService } from '../userbasics/userbasics.service';
import { ContenteventsService } from '../../content/contentevents/contentevents.service';
import { PostsService } from '../../content/posts/posts.service';

@Injectable()
export class UserplaylistService {
  constructor(
    @InjectModel(Userplaylist.name, 'SERVER_TRANS')
    private readonly userplaylistModel: Model<UserplaylistDocument>,
    private readonly utilsService: UtilsService,
    private readonly errorHandler: ErrorHandler,
    private readonly mediadiariesService: MediadiariesService,
    private readonly mediastoriesService: MediastoriesService,
    private readonly mediavideosService: MediavideosService,
    private readonly mediapictsService: MediapictsService,
    private readonly userbasicsService: UserbasicsService,
    private readonly contenteventsService: ContenteventsService,
    private readonly postsService: PostsService,
  ) { }

  async create(CreateUserplaylistDto_: CreateUserplaylistDto): Promise<Userplaylist> {
    const _createUserbasicDto_ = await this.userplaylistModel.create(
      CreateUserplaylistDto_,
    );
    return _createUserbasicDto_;
  }

  async findAll(): Promise<Userplaylist[]> {
    return this.userplaylistModel.find().exec();
  }

  async findid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: id }).exec();
  }

  async findbyid(id: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ _id: new Types.ObjectId(id) }).exec();
  }

  async findOne(email: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ email: email }).exec();
  }

  async findOnedata(userId_: string, userPostId_: string, mediaId_: string): Promise<Userplaylist[]> {
    const _query_ = await this.userplaylistModel.find(
      { userId: new Types.ObjectId(userId_), userPostId: new Types.ObjectId(userPostId_), mediaId: mediaId_ }
    ).exec();
    return _query_;
  }

  async findOneUsername(username: string): Promise<Userplaylist> {
    return this.userplaylistModel.findOne({ username: username }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.userplaylistModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }

  async generateUserPlaylist(CreateUserplaylistDto_: CreateUserplaylistDto){
    if (CreateUserplaylistDto_.userPostId == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param userPostId is required',
      );
    }
    if (CreateUserplaylistDto_.mediaId == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param mediaId is required',
      );
    }
    if (CreateUserplaylistDto_.postType == undefined) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, param postType is required',
      );
    }

    var userPostId = CreateUserplaylistDto_.userPostId;
    var mediaId = CreateUserplaylistDto_.mediaId;
    var postType = CreateUserplaylistDto_.postType;
    
    var current_date = await this.utilsService.getDateTimeString();
    var data_userbasic_all = await this.userbasicsService.findAll();
    var data_media = null;

    if (postType =="vid"){
      data_media = await this.mediavideosService.findOne(mediaId.toString());
    } else if (postType == "pict") {
      data_media = await this.mediapictsService.findOne(mediaId.toString());
    } else if (postType == "diary") {
      data_media = await this.mediadiariesService.findOne(mediaId.toString());
    } else if (postType == "story") {
      data_media = await this.mediastoriesService.findOne(mediaId.toString());
    }

    if (!(await this.utilsService.ceckData(data_media))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_media not found',
      );
    }

    var data_userbasic = await this.userbasicsService.findbyid(userPostId.toString());
    var data_post = await this.postsService.findid(data_media.postID);

    if (!(await this.utilsService.ceckData(data_userbasic))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_userbasic not found',
      );
    }

    if (!(await this.utilsService.ceckData(data_post))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, data_post not found',
      );
    }

    data_userbasic_all.forEach(async element => {
      var post_array_interest = data_post.category;
      var user_array_interest = element.userInterests;

      var post_array_interest_toString = null;
      var post_array_interest_string = null;
      var user_array_interest_toString = null;
      var user_array_interest_string = null;

      var compare_interest = null;
      var Count_compare_interest = 0;

      if (post_array_interest.length > 0) {
        post_array_interest_toString = post_array_interest.map(function (item) { return '"' + JSON.parse(JSON.stringify(item)).$id + '"' }).join(",");
        post_array_interest_string = JSON.parse("[" + post_array_interest_toString + "]");
      }
      if (user_array_interest.length > 0) {
        user_array_interest_toString = user_array_interest.map(function (item) {
          if ((JSON.parse(JSON.stringify(item)) != null)) {
            return '"' + JSON.parse(JSON.stringify(item)).$id + '"'
          }
        }).join(",");
        user_array_interest_string = JSON.parse("[" + user_array_interest_toString + "]");
      }
      if (post_array_interest_string != null && user_array_interest_string != null) {
        compare_interest = post_array_interest_string.filter(function (obj) {
          return user_array_interest_string.indexOf(obj) !== -1;
        });
      }

      //Compare Get Interes
      if (compare_interest != null) {
        Count_compare_interest = compare_interest.length;
      }

      var type = null;
      var ceckFriendFollowingFollower = await this.contenteventsService.ceckFriendFollowingFollower(data_userbasic.email.toString(), element.email.toString());
      if (await this.utilsService.ceckData(ceckFriendFollowingFollower)) {
        if (ceckFriendFollowingFollower.length == 2) {
          type = "FRIEND";
        }else{
          if (ceckFriendFollowingFollower[0].email == data_userbasic.email.toString()) {
            type = "FOLLOWER";
          } else {
            if (ceckFriendFollowingFollower[0].email == element.email.toString()) {
              type = "FOLLOWING";
            } else {
              type = "PUBLIC";
            }
          }
        }
      }else{
        type = "PUBLIC";
      }
      
      var interest_db = [];
      if (Count_compare_interest > 0) {
        for (var i = 0; i < Count_compare_interest; i++) {
          interest_db.push({
            $ref: "interests_repo",
            $id: Object(compare_interest[i]),
            $db: "hyppe_infra_db"
          })
        }
      }
      var CreateUserplaylistDto_ = new CreateUserplaylistDto();
      CreateUserplaylistDto_.userId = Object(element._id);
      CreateUserplaylistDto_.interestId = Object(interest_db);
      CreateUserplaylistDto_.interestIdCount = Count_compare_interest;
      CreateUserplaylistDto_.userPostId = Object(data_userbasic._id);
      CreateUserplaylistDto_.postType = postType;
      CreateUserplaylistDto_.mediaId = mediaId.toString();
      CreateUserplaylistDto_.type = type;
      CreateUserplaylistDto_.createAt = current_date;
      CreateUserplaylistDto_.updatedAt = current_date;
      CreateUserplaylistDto_.isWatched = false;
      CreateUserplaylistDto_.isHidden = false;

      // const userId = element._id.toString();
      // const userIdPost = data_userbasic._id.toString();
      // const mediaId_ = mediaId.toString();
      //var ceckDataUser_ = await this.userplaylistModel.findOne({ userId: new Types.ObjectId(userId), userPostId: new Types.ObjectId(userIdPost), mediaId: mediaId_ }).clone().exec();
      
      var ceckDataUser_ = await this.userplaylistModel.find(
        { 
          userId: new Types.ObjectId(element._id.toString()), 
          userPostId: new Types.ObjectId(data_userbasic._id.toString()), 
          mediaId: mediaId.toString() 
        }).exec();
      
      if (await this.utilsService.ceckData(ceckDataUser_)){
        await this.userplaylistModel.updateOne(
          { _id: new Types.ObjectId(ceckDataUser_[0]._id.toString()) }, 
          CreateUserplaylistDto_, 
          function (err, docs) {
            if (err) {
              console.log(err)
            }else {
              console.log("Updated Docs : ", docs);
            }
          }).clone().exec();
      } else {
        CreateUserplaylistDto_._id = new mongoose.Types.ObjectId();
        await this.userplaylistModel.create(CreateUserplaylistDto_);
      }
    });
  }
}