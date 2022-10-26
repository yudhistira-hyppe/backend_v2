import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData, VideoList, ImageInfo } from './dto/create-posts.dto';
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
import { CreateUserplaylistDto, MediaData } from '../../trans/userplaylist/dto/create-userplaylist.dto';
import { Userplaylist, UserplaylistDocument } from '../../trans/userplaylist/schemas/userplaylist.schema';
import { PostPlaylistService } from '../postplaylist/postplaylist.service';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import { ErrorHandler } from '../../utils/error.handler';
import * as fs from 'fs';
import { post } from 'jquery';
import { TemplatesRepoService } from '../../infra/templates_repo/templates_repo.service';
import { UnsubscriptionError } from 'rxjs';
import { Userauth } from '../../trans/userauths/schemas/userauth.schema';
import { SettingsService } from '../../trans/settings/settings.service';


//import FormData from "form-data";
var FormData = require('form-data');

@Injectable()
export class DisqusService {
  private readonly logger = new Logger(DisqusService.name);

  constructor(
    @InjectModel(Posts.name, 'SERVER_CONTENT')
    private readonly PostsModel: Model<PostsDocument>,
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
    private postPlaylistService: PostPlaylistService,
    private readonly configService: ConfigService,
    private seaweedfsService: SeaweedfsService,
    private templateService: TemplatesRepoService,
    private settingsService: SettingsService,
    private errorHandler: ErrorHandler,
  ) { }

  async createDisqus(body: any, headers: any): Promise<PostResponseApps> {

    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('createDisqus >>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;
    let msg = new Messages();

    let et = body.eventType;
    if (et != 'DIRECT_MSG' && et != 'COMMENT') {
      let inf = [];
      inf.push("Unable to proceed. Only accept DM and Comment");
      msg.info = inf;
      res.messages = msg;
      res.response_code = 204;
      return res;
    }

    let q = body.isQuery;
    return res;
  }
}