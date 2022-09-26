import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { Mediavideos } from '../mediavideos/schemas/mediavideos.schema';
import { UtilsService } from '../../utils/utils.service';
import { InterestsService } from '../../infra/interests/interests.service';
import { UserauthsService } from '../../trans/userauths/userauths.service';
import { MediavideosService } from '../mediavideos/mediavideos.service';
import { InsightsService } from '../insights/insights.service';
import { Insights } from '../insights/schemas/insights.schema';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { createWriteStream, unlink } from 'fs'
import { Userbasic } from '../../trans/userbasics/schemas/userbasic.schema';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { Contentevents } from '../contentevents/schemas/contentevents.schema';
import { PostsService } from './posts.service';
import { Mediastories } from '../mediastories/schemas/mediastories.schema';
import { MediastoriesService } from '../mediastories/mediastories.service';
import { Mediadiaries } from '../mediadiaries/schemas/mediadiaries.schema';
import { Mediapicts } from '../mediapicts/schemas/mediapicts.schema';
import { MediapictsService } from '../mediapicts/mediapicts.service';
import { MediadiariesService } from '../mediadiaries/mediadiaries.service';
import { MediaprofilepictsService } from '../mediaprofilepicts/mediaprofilepicts.service';
import { IsDefined } from 'class-validator';
import { CreateUserplaylistDto } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from 'src/trans/userplaylist/schemas/userplaylist.schema';


@Injectable()
export class PostContentService {
  private readonly logger = new Logger(PostContentService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
    @InjectModel(Userplaylist.name, 'SERVER_TRANS')
    private readonly playlistModel: Model<UserplaylistDocument>,    
    private postService: PostsService,
    private userService: UserbasicsService,
    private utilService: UtilsService,
    private interestService: InterestsService,
    private userAuthService: UserauthsService,
    private videoService: MediavideosService,
    private storyService: MediastoriesService,
    private picService: MediapictsService,
    private diaryService: MediadiariesService,
    private insightService: InsightsService,
    private contentEventService: ContenteventsService,
    private profilePictService: MediaprofilepictsService,
    private readonly configService: ConfigService,
  ) { }

  async createNewPost(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPost >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    if (body.certified && body.certified == "true") {
      if (profile.isIdVerified != true) {
        let msg = new Messages();
        msg.info = ["The user ID has not been verified"];
        res.messages = msg;
        return res;
      }
    }

    var mime = file.mimetype;
    if (mime.startsWith('video')) {
      this.logger.log('createNewPost >>> is video');
      return this.createNewPostVideo(file, body, headers);
    } else {
      this.logger.log('createNewPost >>> is picture');
      return this.createNewPostPict(file, body, headers);
    }
  }

  private async buildPost(body: any, headers: any): Promise<Posts> {
    this.logger.log('buildPost >>> start');
    const mongoose = require('mongoose');
    var ObjectId = require('mongodb').ObjectId;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('buildPost >>> profile: ' + profile.email);

    let post = new Posts();
    post._id = await this.utilService.generateId();
    post.postID = post._id;
    post.postType = body.postType;
    post.active = true;
    post.email = auth.email;
    post.createdAt = await this.utilService.getDateTimeString();
    post.updatedAt = await this.utilService.getDateTimeString();
    let big = BigInt(this.utilService.generateAddExpirationFromToday(1));
    post.expiration = Long.fromBigInt(big);
    post._class = 'io.melody.hyppe.content.domain.ContentPost';

    if (body.description != undefined) {
      post.description = body.description;
    }

    if (body.tags != undefined) {
      var obj = body.tags;
      var tgs = obj.split(",");
      post.tags = tgs;
    }

    if (body.visibility != undefined) {
      post.visibility = body.visibility;
    } else {
      post.visibility = 'PUBLIC';
    }

    if (body.location != undefined) {
      post.location = body.location;
    }

    if (body.lat != undefined) {
      post.lat = body.lat;
    }

    if (body.lon != undefined) {
      post.lon = body.lon;
    }

    if (body.saleAmount != undefined) {
      post.saleAmount = body.saleAmount;
    } else {
      post.saleAmount = null;
    }

    if (body.saleLike != undefined) {
      post.saleLike = body.saleLike;
    } else {
      post.saleLike = false;
    }

    if (body.saleView != undefined) {
      post.saleView = body.saleView;
    } else {
      post.saleView = false;
    }

    if (body.allowComments != undefined) {
      post.allowComments = body.allowComments;
    } else {
      post.allowComments = true;
    }

    if (body.isSafe != undefined) {
      post.isSafe = body.isSafe;
    } else {
      post.isSafe = false;
    }

    if (body.isOwned != undefined) {
      post.isOwned = body.isOwned;
    } else {
      post.isOwned = false;
    }

    if (body.certified != undefined) {
      post.certified = body.certified;
    } else {
      post.certified = false;
    }

    var usp = { "$ref": "userbasics", "$id": mongoose.Types.ObjectId(profile._id), "$db": "hyppe_trans_db" };
    post.userProfile = usp;

    if (body.cats != undefined && body.cats.length > 1) {
      var obj = body.cats;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var cat = await this.interestService.findByName(tmp);
        if (cat != undefined) {
          var objintr = { "$ref": "interests_repo", "$id": mongoose.Types.ObjectId(cat._id), "$db": "hyppe_infra_db" };
          pcats.push(objintr);
        }
      }
      post.category = pcats;
    }

    if (body.tagPeople != undefined && body.tagPeople.length > 1) {
      var obj = body.tagPeople;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (cat != undefined) {
          var objintr = { "$ref": "userauths", "$id": mongoose.Types.ObjectId(tp._id), "$db": "hyppe_trans_db" };
          pcats.push(objintr);
        }
      }
      post.tagPeople = pcats;
    }

    if (body.tagDescription != undefined && body.tagDescription.length > 0) {
      var obj = body.tagDescription;
      var cats = obj.split(",");
      var pcats = [];
      for (var i = 0; i < cats.length; i++) {
        var tmp = cats[i];
        var tp = await this.userAuthService.findOneUsername(tmp);
        if (cat != undefined) {
          var objintrx = { "$ref": "userauths", "$id": tp._id, "$db": "hyppe_trans_db" };
          pcats.push(objintrx);
        }
      }
      post.tagDescription = pcats;
    }

    post.active = false;

    //TODO Insight
    var ins = await this.insightService.findemail(auth.email);
    if (ins == undefined) {
      ins = new Insights();
      ins._id = await this.utilService.generateId();
      ins.insightID = ins._id;
      ins.active = true;
      ins.email = auth.email
      ins.createdAt = await this.utilService.getDateTimeString();
      ins.updatedAt = await this.utilService.getDateTimeString();
      ins._class = 'io.melody.hyppe.content.domain.Insight';

      if (post.postType != 'story') {
        ins.posts = new Long(1);
      }
    } else {

      if (post.postType != 'story') {
        //TODO BUG BUG BUG
        let prevPost = ins.posts;
        let nextPost = Number(prevPost) + 1;
        ins.posts = new Long(nextPost);
      }

    }
    this.insightService.create(ins);

    //TODO ContentEVent
    var ce = new Contentevents();
    ce._id = await this.utilService.generateId();
    ce.contentEventID = ce._id;
    ce.eventType = 'POST';
    ce.createdAt = await this.utilService.getDateTimeString();
    ce.updatedAt = await this.utilService.getDateTimeString();
    ce.active = true;
    ce.event = 'ACCEPT';
    ce.flowIsDone = true;
    ce.email = auth.email;
    ce.sequenceNumber = 0;
    ce._class = 'io.melody.hyppe.content.domain.ContentEvent';
    this.contentEventService.create(ce);

    return post;
  }

  private async createNewPostVideo(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {
    this.logger.log('createNewPostVideo >>> start: ' + JSON.stringify(body));
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    let post = await this.buildPost(body, headers);

    let postType = body.postType;
    var cm = [];

    let mediaId = "";
    if (postType == 'vid') {
      let metadata = { postType: 'vid', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0 };
      post.metadata = metadata;

      var med = new Mediavideos();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'video';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaVideo';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retd = await this.videoService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retd);

      var vids = { "$ref": "mediavideos", "$id": retd.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

    } else if (postType == 'advertise') {

    } else if (postType == 'story') {

      var mime = file.mimetype;
      if (mime.startsWith('video')) {
        let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0 };
        post.metadata = metadata;
      }

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'video';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    } else if (postType == 'diary') {

      let metadata = { postType: 'diary', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0 };
      post.metadata = metadata;

      var mer = new Mediadiaries();
      mer._id = await this.utilService.generateId();
      mer.mediaID = mer._id;
      mer.postID = post.postID;
      mer.active = false;
      mer.createdAt = await this.utilService.getDateTimeString();
      mer.updatedAt = await this.utilService.getDateTimeString();
      mer.mediaMime = file.mimetype;
      mer.mediaType = 'video';
      mer.originalName = file.originalname;
      mer.apsara = true;
      mer._class = 'io.melody.hyppe.content.domain.MediaDiary';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retr = await this.diaryService.create(mer);

      this.logger.log('createNewPostVideo >>> ' + retr);

      var diaries = { "$ref": "mediadiaries", "$id": retr.mediaID, "$db": "hyppe_content_db" };
      cm.push(diaries);
    }

    post.contentMedias = cm;
    let apost = await this.PostsModel.create(post);

    let fn = file.originalname;
    let ext = fn.split(".");
    let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + post._id + "." + ext[1];
    const ws = createWriteStream(nm);
    ws.write(file.buffer);
    ws.close();

    let payload = { 'file': nm, 'postId': apost._id };
    axios.post(this.configService.get("APSARA_UPLOADER_VIDEO"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);

    return res;
  }

  private async createNewPostPict(file: Express.Multer.File, body: any, headers: any): Promise<CreatePostResponse> {

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);

    let post = await this.buildPost(body, headers);
    let postType = body.postType;
    var cm = [];
    let mediaId = "";

    if (postType == 'pict') {
      var med = new Mediapicts();
      med._id = await this.utilService.generateId();
      med.mediaID = med._id;
      med.postID = post.postID;
      med.active = false;
      med.createdAt = await this.utilService.getDateTimeString();
      med.updatedAt = await this.utilService.getDateTimeString();
      med.mediaMime = file.mimetype;
      med.mediaType = 'image';
      med.originalName = file.originalname;
      med.apsara = true;
      med._class = 'io.melody.hyppe.content.domain.MediaPict';

      this.logger.log('createNewPostVideo >>> prepare save');
      var retm = await this.picService.create(med);

      this.logger.log('createNewPostVideo >>> ' + retm);

      var vids = { "$ref": "mediapicts", "$id": retm.mediaID, "$db": "hyppe_content_db" };
      cm.push(vids);

      mediaId = String(retm.mediaID);
    } else if (postType == 'story') {
      let metadata = { postType: 'story', duration: 0, postID: post._id, email: auth.email, postRoll: 0, midRoll: 0, preRoll: 0 };
      post.metadata = metadata;

      var mes = new Mediastories();
      mes._id = await this.utilService.generateId();
      mes.mediaID = mes._id;
      mes.postID = post.postID;
      mes.active = false;
      mes.createdAt = await this.utilService.getDateTimeString();
      mes.updatedAt = await this.utilService.getDateTimeString();
      mes.mediaMime = file.mimetype;
      mes.mediaType = 'image';
      mes.originalName = file.originalname;
      mes.apsara = true;
      mes._class = 'io.melody.hyppe.content.domain.MediaStory';

      this.logger.log('createNewPostVideo >>> prepare save');
      var rets = await this.storyService.create(mes);

      this.logger.log('createNewPostVideo >>> ' + rets);

      var stories = { "$ref": "mediastories", "$id": rets.mediaID, "$db": "hyppe_content_db" };
      cm.push(stories);

      mediaId = String(rets.mediaID);

    }
    post.contentMedias = cm;
    let apost = await this.PostsModel.create(post);

    let fn = file.originalname;
    let ext = fn.split(".");
    let nm = this.configService.get("APSARA_UPLOADER_FOLDER") + post._id + "." + ext[1];
    const ws = createWriteStream(nm);
    ws.write(file.buffer);
    ws.close();

    let payload = { 'file': nm, 'postId': apost._id };
    axios.post(this.configService.get("APSARA_UPLOADER_PICTURE"), JSON.stringify(payload), { headers: { 'Content-Type': 'application/json' } });

    let playlist = new CreateUserplaylistDto();
    playlist.userPostId = Object(profile._id);
    playlist.postType = post.postType;
    playlist.mediaId = Object(mediaId);
    this.logger.log('createNewPostPic >>> generate playlist ' + JSON.stringify(playlist));
    this.postService.generateUserPlaylist(playlist);

    var res = new CreatePostResponse();
    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    var pd = new PostData();
    pd.postID = String(apost.postID);
    pd.email = String(apost.email);

    return res;
  }



  async updateNewPost(body: any, headers: any) {
    this.logger.log('updateNewPost >>> start');
    let post = await this.postService.findid(body.postID);
    if (post == undefined) {
      return;
    }
    let cm = post.contentMedias[0];
    let ns = cm.namespace;
    this.logger.log('updateNewPost >>> namespace: ' + ns);
    if (ns == 'mediavideos') {
      let vid = await this.videoService.findOne(cm.oid);
      if (vid == undefined) {
        return;
      }

      vid.apsaraId = body.videoId;
      vid.active = true;
      this.videoService.create(vid);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll };
      post.metadata = metadata;
      post.active = true;
      this.postService.create(post);
    } else if (ns == 'mediapicts') {
      let pic = await this.picService.findOne(cm.oid);
      if (pic == undefined) {
        return;
      }

      pic.apsaraId = body.videoId;
      pic.active = true;
      this.picService.create(pic);

      post.active = true;
      this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });
    } else if (ns == 'mediastories') {
      let st = await this.storyService.findOne(cm.oid);
      if (st == undefined) {
        return;
      }

      st.apsaraId = body.videoId;
      st.active = true;
      this.storyService.create(st);

      post.active = true;

      this.logger.log('updateNewPost >>> mediatype: ' + st.mediaType);
      if (st.mediaType == 'video') {
        let meta = post.metadata;
        let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll };
        post.metadata = metadata;
      }
      this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });
    } else if (ns == 'mediadiaries') {
      let dy = await this.diaryService.findOne(cm.oid);
      if (dy == undefined) {
        return;
      }

      dy.apsaraId = body.videoId;
      dy.active = true;
      this.diaryService.create(dy);

      let meta = post.metadata;
      let metadata = { postType: meta.postType, duration: parseInt(body.duration), postID: post._id, email: meta.email, postRoll: meta.postRoll, midRoll: meta.midRoll, preRoll: meta.preRoll };
      post.metadata = metadata;
      post.active = true;
      this.postService.create(post);

      let todel = body.filedel + "";
      unlink(todel, (err) => {
        if (err) {

        }
      });
    }


  }

  async getUserPost(body: any, headers: any): Promise<PostResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == null) {
      let res = new PostResponseApps();
      let msg = new Messages
      msg.info = ["User tidak tedaftar"];
      res.messages = msg;
      res.response_code = 204;
      return res;
    }
    this.logger.log('getUserPost >>> profile: ' + profile.email);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostPlaylist(body, headers, profile);
    let pd = await this.loadPostData(posts, body, profile);
    res.data = pd;

    return res;
  }

  async getUserPostMy(body: any, headers: any): Promise<PostResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostMy(body, headers, profile);
    let pd = await this.loadPostData(posts, body, profile);
    res.data = pd;

    return res;
  }

  async getUserPostByProfile(body: any, headers: any): Promise<PostResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(body.email);
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;
    let posts = await this.doGetUserPostTheir(body, headers, profile);
    let pd = await this.loadPostData(posts, body, profile);
    res.data = pd;

    return res;
  }

  private async doGetUserPost(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    let query = this.PostsModel.find();
    if (body.visibility != undefined) {
      if (body.visibility == 'PRIVATE') {
        query.where('email', whoami.email);
      } else if (body.visibility == 'FOLLOWING') {
        let following = [];
        let check = await this.contentEventService.findFollowing(whoami.email);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var ce = check[i];
            if (ce.receiverParty != undefined && ce.receiverParty.length > 1) {
              following.push({ email: ce.receiverParty });
            }
          }
        }

        query.where('visibility').in(['FRIEND', 'PUBLIC']).or(following);
      } else if (body.visibility == 'FRIEND') {
        let friend = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(cex.friend);
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in(['FRIEND', 'PUBLIC']);
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
        }
      } else {
        let friend = [];
        let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
        if (check != undefined) {
          for (let i = 0; i < check.length; i++) {
            var cex = check[i];
            friend.push(cex.friend);
          }
        }

        if (friend.length > 0) {
          friend.push(whoami.email);
          query.where('visibility').in(['FRIEND', 'PUBLIC']);
          query.where('email').in(friend);
        } else {
          query.where('visibility', 'PUBLIC');
        }
      }
    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('active', true);
    }

    if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
      this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
      query.where('expiration').gte(this.utilService.generateExpirationFromToday(1));
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'postType': 1, 'createdAt': -1 });
    let res = await query.exec();
    return res;
  }

  private async doGetUserPostPlaylist(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    this.logger.log('doGetUserPostPlaylist >>> start: ' + body);
    let query = this.playlistModel.find();
    if (body.visibility != undefined) {
      query.where('type', body.visibility);
    }

    if (body.postID != undefined) {
      query.where('postID', body.postID);
    }

    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('isHidden', true);
    }

    if (body.withExp != undefined && (body.withExp == 'true' || body.withExp == true)) {
      this.logger.log("doGetUserPost >>> today: " + this.utilService.now());
      query.where('expiration').gte(this.utilService.generateExpirationFromToday(1));
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;      
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);         
    query.sort({'postType': 1, 'createdAt': -1});
    let res = await query.exec();
    
    let pids:String[] = [];
    for (let x = 0; x < res.length; x++) {
      let tmp = pids[x];
      let pid = tmp.postId;
      pids.push(pid);
    }

    let queryp = this.PostsModel.find();
    return queryp.where('postId').in(pids);

  }  

  private async doGetUserPostMy(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    let query = this.PostsModel.find();
    query.where('email', whoami.email);
    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('active', true);
    }
    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'postType': 1, 'createdAt': -1 });
    let res = await query.exec();
    return res;
  }

  private async doGetUserPostTheir(body: any, headers: any, whoami: Userbasic): Promise<Posts[]> {
    //this.logger.log('doGetUserPost >>> start: ' + body);
    let query = this.PostsModel.find();
    query.where('email', whoami.email);
    let friend = [];
    let check = await this.contentEventService.friend(whoami.email.valueOf(), whoami);
    if (check != undefined) {
      for (let i = 0; i < check.length; i++) {
        var cex = check[i];
        friend.push(cex.friend);
      }
    }

    if (friend.length > 0) {
      friend.push(whoami.email);
      query.where('visibility').in(['FRIEND', 'PUBLIC']);
      query.where('email').in(friend);
    } else {
      query.where('visibility', 'PUBLIC');
    }
    if (body.withActive != undefined && (body.withActive == 'true' || body.withActive == true)) {
      query.where('active', true);
    }
    if (body.postType != undefined) {
      query.where('postType', body.postType);
    } else {
      query.where('postType').ne('advertise');
    }

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }
    let skip = this.paging(page, row);
    query.skip(skip);
    query.limit(row);
    query.sort({ 'postType': 1, 'createdAt': -1 });
    let res = await query.exec();
    return res;
  }

  private async loadPostData(posts: Posts[], body: any, iam: Userbasic): Promise<PostData[]> {
    let pd = Array<PostData>();
    if (posts != undefined) {

      let vids: String[] = [];
      let pics: String[] = [];

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];
        let pa = new PostData();

        pa.active = ps.active;
        pa.allowComments = ps.allowComments;
        pa.certified = ps.certified;
        pa.createdAt = String(ps.createdAt);
        pa.updatedAt = String(ps.updatedAt);
        pa.description = String(ps.description);
        pa.email = String(ps.email);

        let following = await this.contentEventService.findFollowing(pa.email);

        if (ps.userProfile != undefined) {
          if (ps.userProfile?.namespace) {
            let oid = String(ps.userProfile.oid);
            let ua = await this.userService.findbyid(oid.toString());
            if (ua != undefined) {
              let ub = await this.userAuthService.findOneByEmail(ua.email);
              if (ub != undefined) {
                pa.username = ub.username;
              }

              pa.avatar = await this.getProfileAvatar(ua);
            } else {
              this.logger.log('oid: ' + oid + ' error');
            }
          }
        }

        pa.isApsara = false;
        pa.location = ps.location;
        pa.visibility = String(ps.visibility);

        if (ps.metadata != undefined) {
          let md = ps.metadata;
          let md1 = new Metadata();
          md1.duration = Number(md.duration);
          md1.email = String(md.email);
          md1.midRoll = Number(md.midRoll);
          md1.postID = String(md.postID);
          md1.postRoll = Number(md.postRoll);
          md1.postType = String(md.postType);
          md1.preRoll = Number(md.preRoll);
          pa.metadata = md1;
        }


        pa.postID = String(ps.postID);
        pa.postType = String(ps.postType);
        pa.saleAmount = ps.saleAmount;
        pa.saleLike = ps.saleLike;
        pa.saleView = ps.saleView;

        if (ps.tagPeople != undefined && ps.tagPeople.length > 0) {
          let atp = ps.tagPeople;
          let atp1 = Array<TagPeople>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.userAuthService.findById(oid.toString());
              if (ua != undefined) {
                let tp1 = new TagPeople();
                tp1.email = String(ua.email);
                tp1.username = String(ua.username);

                let ub = await this.userService.findOne(String(ua.email));
                if (ub != undefined) {
                  tp1.avatar = await this.getProfileAvatar(ub);
                }

                tp1.status = 'TOFOLLOW';
                if (tp1.email == pa.email) {
                  tp1.status = "UNLINK";
                } else {
                  for (let i = 0; i < following.length; i++) {
                    let fol = following[i];
                    if (fol.email == tp1.email) {
                      tp1.status = "FOLLOWING";
                    }
                  }
                }
                atp1.push(tp1);
              }
            }
          }

          pa.tagPeople = atp1;
        }

        if (ps.category != undefined && ps.category.length > 0) {
          let atp = ps.category;
          let atp1 = Array<Cat>();

          for (let x = 0; x < atp.length; x++) {
            let tp = atp[i];
            if (tp?.namespace) {
              let oid = tp.oid;
              let ua = await this.interestService.findOne(oid.toString());
              if (ua != undefined) {
                let tp1 = new Cat();
                tp1._id = String(ua._id);
                tp1.interestName = String(ua.interestName);
                tp1.langIso = String(ua.langIso);
                tp1.icon = String(ua.icon);
                tp1.createdAt = String(ua.createdAt);
                tp1.updatedAt = String(ua.updatedAt);

                atp1.push(tp1);
              }
            }
          }
          pa.cats = atp1;
        }

        let privacy = new Privacy();
        privacy.isPostPrivate = false;
        privacy.isPrivate = false;
        privacy.isCelebrity = false;
        pa.privacy = privacy;

        pa.tags = ps.tags;

        //Insight

        if ((body.withInsight != undefined && (body.withInsight == true || body.withInsight == 'true'))) {
          let insight = await this.insightService.findemail(String(ps.email));
          if (insight == undefined) {
            continue;
          }

          let tmp = new InsightPost();
          tmp.follower = Number(insight.followers);
          tmp.following = Number(insight.followings);
          tmp.likes = Number(insight.likes);
          tmp.views = Number(insight.views);
          tmp.shares = Number(insight.shares);
          tmp.comments = Number(insight.comments);
          tmp.reactions = Number(insight.reactions);
          pa.insight = tmp;

        }

        //MEDIA
        let meds = ps.contentMedias;
        if (meds != undefined) {
          for (let i = 0; i < meds.length; i++) {
            let med = meds[i];
            let ns = med.namespace;
            if (ns == 'mediavideos') {
              let video = await this.videoService.findOne(String(med.oid));
              if (video.apsara == true) {
                vids.push(video.apsaraId);
                pa.apsaraId = String(video.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = video.mediaThumb;
                pa.mediaEndpoint = '/stream/' + video.mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + video.postID;
              }

              //mediatype
              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (video.viewers != undefined && video.viewers.length > 0) {
                for (let i = 0; i < video.viewers.length; i++) {
                  let vwt = video.viewers[i];
                  let vwns = vwt.namespace;
                  if (vwns == 'userbasics') {
                    let vw = await this.userService.findbyid(vwns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }

            } else if (ns == 'mediapicts') {
              let pic = await this.picService.findOne(String(med.oid));
              if (pic.apsara == true) {
                pics.push(pic.apsaraId);
                pa.apsaraId = String(pic.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaEndpoint = '/pict/' + pic.postID;
                pa.mediaUri = pic.mediaUri;
              }

              pa.mediaType = 'image';

              //isview
              pa.isViewed = false;
              if (pic.viewers != undefined && pic.viewers.length > 0) {
                for (let i = 0; i < pic.viewers.length; i++) {
                  let pct = pic.viewers[i];
                  let pcns = pct.namespace;
                  if (pcns == 'userbasics') {
                    let vw = await this.userService.findbyid(pcns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediadiaries') {
              let diary = await this.diaryService.findOne(String(med.oid));
              if (diary.apsara == true) {
                vids.push(diary.apsaraId);
                pa.apsaraId = String(diary.apsaraId);
                pa.isApsara = true;
              } else {
                pa.mediaThumbUri = diary.mediaThumb;
                pa.mediaEndpoint = '/stream/' + diary.mediaUri;
                pa.mediaThumbEndpoint = '/thumb/' + diary.postID;
              }

              pa.mediaType = 'video';

              //isview
              pa.isViewed = false;
              if (diary.viewers != undefined && diary.viewers.length > 0) {
                for (let i = 0; i < diary.viewers.length; i++) {
                  let drt = diary.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let vw = await this.userService.findbyid(drns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            } else if (ns == 'mediastories') {
              let story = await this.storyService.findOne(String(med.oid));

              if (story.mediaType == 'video') {
                if (story.apsara == true) {
                  vids.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/stream/' + story.mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'video';
              } else {
                if (story.apsara == true) {
                  pics.push(story.apsaraId);
                  pa.apsaraId = String(story.apsaraId);
                  pa.isApsara = true;
                } else {
                  pa.mediaThumbUri = story.mediaThumb;
                  pa.mediaEndpoint = '/pict/' + story.mediaUri;
                  pa.mediaThumbEndpoint = '/thumb/' + story.postID;
                }
                pa.mediaType = 'image';
              }

              //isview
              pa.isViewed = false;
              if (story.viewers != undefined && story.viewers.length > 0) {
                for (let i = 0; i < story.viewers.length; i++) {
                  let drt = story.viewers[i];
                  let drns = drt.namespace;
                  if (drns == 'userbasics') {
                    let vw = await this.userService.findbyid(drns.oid);
                    if (vw != undefined && vw.email == iam.email) {
                      pa.isViewed = true;
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        pd.push(pa);
      }

      if (vids.length > 0) {
        let res = await this.getVideoApsara(vids);
        if (res != undefined && res.VideoList != undefined && res.VideoList.length > 0) {
          for (let i = 0; i < res.VideoList.length; i++) {
            let vi = res.VideoList[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.VideoId) {
                ps.mediaThumbEndpoint = vi.CoverURL;
              }
            }
          }
        }
      }

      if (pics.length > 0) {
        let res = await this.getImageApsara(pics);
        if (res != undefined && res.ImageInfo != undefined && res.ImageInfo.length > 0) {
          for (let i = 0; i < res.ImageInfo.length; i++) {
            let vi = res.ImageInfo[i];
            for (let j = 0; j < pd.length; j++) {
              let ps = pd[j];
              if (ps.apsaraId == vi.ImageId) {
                ps.mediaThumbEndpoint = vi.URL;
                ps.mediaThumbUri = vi.URL;
              }
            }
          }
        }
      }
    }
    return pd;
  }

  public async getVideoApsara(ids: String[]): Promise<ApsaraVideoResponse> {
    let vids = ids.join(',');
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
    let tx: ApsaraVideoResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
    return tx;
  }

  public async getImageApsara(ids: String[]): Promise<ApsaraImageResponse> {
    let vids = ids.join(',');
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
    let tx: ApsaraImageResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));
    return tx;
  }

  async getVideoApsaraSingle(ids: String): Promise<ApsaraPlayResponse> {
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let params = {
      "RegionId": this.configService.get("APSARA_REGION_ID"),
      "VideoId": ids
    }

    let requestOption = {
      method: 'POST'
    };

    let dto = new ApsaraVideoResponse();
    let result = await client.request('GetPlayInfo', params, requestOption);
    let xres = new ApsaraPlayResponse();
    if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
      xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
    }
    return xres;
  }

  private paging(page: number, row: number) {
    if (page == 0 || page == 1) {
      return 0;
    }
    let num = ((page - 1) * row);
    return num;
  }

  private async getProfileAvatar(profile: Userbasic) {
    if (profile == undefined || profile.profilePict == undefined) {
      return undefined;
    }

    let cm = profile.profilePict;
    let ns = cm.namespace;
    if (ns == 'mediaprofilepicts') {
      let pp = await this.profilePictService.findOne(cm.oid);
      if (pp == undefined) {
        return;
      }

      let av = new Avatar();
      av.mediaBasePath = String(pp.mediaBasePath);
      av.mediaType = String(pp.mediaType);
      av.mediaUri = String(pp.mediaUri);
      av.mediaEndpoint = '/profilepict/' + pp.mediaID;
      return av;
    }
    return undefined;
  }
}
