import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData, VideoList, ImageInfo } from './dto/create-posts.dto';
import { Posts, PostsDocument } from './schemas/posts.schema';
import { GetuserprofilesService } from '../../trans/getuserprofiles/getuserprofiles.service';
import { UserbasicsService } from '../../trans/userbasics/userbasics.service';
import { UserbasicnewService } from '../../trans/userbasicnew/userbasicnew.service';
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
import { CreateUserplaylistDto, MediaData } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from '../../trans/userplaylist/schemas/userplaylist.schema';
import { PostPlaylistService } from '../postplaylist/postplaylist.service';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import { ErrorHandler } from '../../utils/error.handler';
import * as fs from 'fs';
import { post } from 'jquery';
import { TemplatesRepoService } from '../../infra/templates_repo/templates_repo.service';
import { DisqusService } from '../disqus/disqus.service';
import { DisquslogsService } from '../disquslogs/disquslogs.service';
import { CreateDisquslogsDto } from '../disquslogs/dto/create-disquslogs.dto';
import { LogapisService } from 'src/trans/logapis/logapis.service'; 


//import FormData from "form-data";
var FormData = require('form-data');

@Injectable()
export class PostCommentService {
  private readonly logger = new Logger(PostCommentService.name);

  constructor(
    private postService: PostsService,
    private userService: UserbasicsService,
    private utilService: UtilsService,
    private disqusService: DisqusService,
    private disqusLogService: DisquslogsService,
    private storyService: MediastoriesService,
    private picService: MediapictsService,
    private diaryService: MediadiariesService,
    private insightService: InsightsService,
    private contentEventService: ContenteventsService,
    private profilePictService: MediaprofilepictsService,
    private postPlaylistService: PostPlaylistService,
    private readonly configService: ConfigService,
    private seaweedfsService: SeaweedfsService,
    private templateService: TemplatesRepoService,
    private videoService: MediavideosService,
    private errorHandler: ErrorHandler,
    private logapiSS: LogapisService,
    private UserbasicnewService: UserbasicnewService,
  ) { }

  async removeComment(body: any, headers: any): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/removecomment";
    var reqbody = JSON.parse(JSON.stringify(body));

    this.logger.log('removeComment >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);      

      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    let dis = await this.disqusLogService.findOne(body.disqusLogID);
    if (dis == undefined) {
        var timestamps_end = await this.utilService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

        let msg = new Messages();
        msg.info = ["Disqus ID unknown"];
        res.messages = msg;
        return res;        
    }

    console.log((dis.sender == profile.email || dis.receiver == profile.email));
    if (dis.sender == profile.email || dis.receiver == profile.email) {
      var createDisquslogsDto_ = new CreateDisquslogsDto();
      console.log((dis.sequenceNumber));
      console.log((dis.sequenceNumber == 0));
      if (dis.sequenceNumber==0){
        this.postService.updateCommentMin(profile.email.toString(), dis.postID.toString());
        var replyLog = dis.replyLogs;
        console.log("replyLog : ",replyLog);
      }
      var ByparentID = await this.disqusLogService.findByParentID(body.disqusLogID);
      console.log(ByparentID.length);
      if (ByparentID.length > 0) {
        this.postService.updateCommentMin2(profile.email.toString(), dis.postID.toString(), ((ByparentID.length)*-1));
        await this.disqusLogService.updateMany(body.disqusLogID);
      }
      createDisquslogsDto_.active = false;
      await this.disqusLogService.update(body.disqusLogID, createDisquslogsDto_);
        //this.disqusLogService.delete(String(dis._id));
    }

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    
    return res;
  }
  async removeComment2(body: any, headers: any): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/removecomment";
    var reqbody = JSON.parse(JSON.stringify(body));

    this.logger.log('removeComment >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);      

      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    let dis = await this.disqusLogService.findOne(body.disqusLogID);
    if (dis == undefined) {
        var timestamps_end = await this.utilService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

        let msg = new Messages();
        msg.info = ["Disqus ID unknown"];
        res.messages = msg;
        return res;        
    }

    console.log((dis.sender == profile.email || dis.receiver == profile.email));
    if (dis.sender == profile.email || dis.receiver == profile.email) {
      var createDisquslogsDto_ = new CreateDisquslogsDto();
      console.log((dis.sequenceNumber));
      console.log((dis.sequenceNumber == 0));
      if (dis.sequenceNumber==0){
        this.postService.updateCommentMin(profile.email.toString(), dis.postID.toString());
        var replyLog = dis.replyLogs;
        console.log("replyLog : ",replyLog);
      }
      var ByparentID = await this.disqusLogService.findByParentID(body.disqusLogID);
      console.log(ByparentID.length);
      if (ByparentID.length > 0) {
        this.postService.updateCommentMin2(profile.email.toString(), dis.postID.toString(), ((ByparentID.length)*-1));
        await this.disqusLogService.updateMany(body.disqusLogID);
      }
      createDisquslogsDto_.active = false;
      await this.disqusLogService.update(body.disqusLogID, createDisquslogsDto_);
        //this.disqusLogService.delete(String(dis._id));
    }

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    
    return res;
  }

  async postViewer(body: any, headers: any): Promise<CreatePostResponse> {
    var timestamps_start = await this.utilService.getDateTimeString();
    var fullurl = headers.host + "/api/posts/postviewer";
    var reqbody = JSON.parse(JSON.stringify(body));
    
    this.logger.log('postViewer >>> start: ' + JSON.stringify(body));
    var res = new CreatePostResponse();
    res.response_code = 204;

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    if (profile == undefined) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      let msg = new Messages();
      msg.info = ["Email unknown"];
      res.messages = msg;
      return res;
    }

    let pst = await this.postService.findid(String(body.postID));
    if (pst == undefined) {
        var timestamps_end = await this.utilService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

        let msg = new Messages();
        msg.info = ["Post ID unknown"];
        res.messages = msg;
        return res;        
    }

    if (pst.contentMedias.length < 1) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      let msg = new Messages();
      msg.info = ["Content Media unknown"];
      res.messages = msg;
      return res;        
    }

    if (String(profile.email) == String(pst.email)) {
      var timestamps_end = await this.utilService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);

      let msg = new Messages();
      msg.info = ["Viewer is poster"];
      res.messages = msg;
      return res;              
    }

    let cm = pst.contentMedias[0];
    let ns = cm.namespace;

    if (ns == 'mediavideos') {
      return await this.insertVideo(profile, cm);
    } if (ns == 'mediapicts') {
      return await this.insertPicture(profile, cm);      
    } if (ns == 'mediastories') {
      return await this.insertStory(profile, cm);            
    }

    let msg = new Messages();
    msg.info = ["Unknown Error"];
    res.messages = msg;

    var timestamps_end = await this.utilService.getDateTimeString();
    this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, auth.email, null, null, reqbody);
    
    return res;
  }  

  private async insertVideo(profile: Userbasic, cm: any) {
    var res = new CreatePostResponse();
    res.response_code = 204;

    let vid = await this.videoService.findOne(cm.oid);
    if (vid == undefined) {
      let msg = new Messages();
      msg.info = ["Media not found"];
      res.messages = msg;
      return res;        
    }

    let found = false;
    let views = vid.viewers;
    for(let i = 0; i < views.length; i++) {
      let view = views[i];
      let oid = String(view.oid);
      if (oid == String(profile._id)) {
        found = true;
        break;
      }
    }

    if (!found) {
      var vids = { "$ref": "userbasics", "$id": profile._id, "$db": "hyppe_trans_db" };
      vid.viewers.push(vids);
      this.videoService.create(vid);        
    }

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;

    return res;
  }

  private async insertPicture(profile: Userbasic, cm: any) {
    var res = new CreatePostResponse();
    res.response_code = 204;

    let vid = await this.picService.findOne(cm.oid);
    if (vid == undefined) {
      let msg = new Messages();
      msg.info = ["Media not found"];
      res.messages = msg;
      return res;        
    }

    let found = false;
    let views = vid.viewers;
    for(let i = 0; i < views.length; i++) {
      let view = views[i];
      let oid = String(view.oid);
      if (oid == String(profile._id)) {
        found = true;
        break;
      }
    }

    if (!found) {
      var vids = { "$ref": "userbasics", "$id": profile._id, "$db": "hyppe_trans_db" };
      vid.viewers.push(vids);
      this.picService.create(vid);        
    }

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    
    return res;
  }  

  private async insertStory(profile: Userbasic, cm: any) {
    var res = new CreatePostResponse();
    res.response_code = 204;

    let vid = await this.storyService.findOne(cm.oid);
    if (vid == undefined) {
      let msg = new Messages();
      msg.info = ["Media not found"];
      res.messages = msg;
      return res;        
    }

    let found = false;
    let views = vid.viewers;
    for(let i = 0; i < views.length; i++) {
      let view = views[i];
      let oid = String(view.oid);
      if (oid == String(profile._id)) {
        found = true;
        break;
      }
    }

    if (!found) {
      var vids = { "$ref": "userbasics", "$id": profile._id, "$db": "hyppe_trans_db" };
      vid.viewers.push(vids);
      this.storyService.create(vid);        
    }

    res.response_code = 202;
    let msg = new Messages();
    msg.info = ["The process successful"];
    res.messages = msg;
    
    return res;
  }    
  
}
