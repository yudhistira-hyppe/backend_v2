import { Logger, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DBRef, Long, ObjectId } from 'mongodb';
import { Model, Types } from 'mongoose';
import { ApsaraImageResponse, ApsaraVideoResponse, Cat, CreatePostResponse, CreatePostsDto, Metadata, PostData, PostResponseApps, Privacy, TagPeople, Messages, InsightPost, ApsaraPlayResponse, Avatar, PostLandingResponseApps, PostLandingData, PostBuildData } from './dto/create-posts.dto';
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
import { PostPlaylistService } from '../postplaylist/postplaylist.service';
import { SeaweedfsService } from '../../stream/seaweedfs/seaweedfs.service';
import { ErrorHandler } from '../../utils/error.handler';
import * as fs from 'fs';
import { Userplaylist } from 'src/trans/userplaylist/schemas/userplaylist.schema';
import { PostContentService } from './postcontent.service';

@Injectable()
export class PostContentPlaylistService {
  private readonly logger = new Logger(PostContentPlaylistService.name);

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
    private postContentService: PostContentService,
    private readonly configService: ConfigService, 
    private seaweedfsService: SeaweedfsService,
    private errorHandler: ErrorHandler,
  ) { }


  async getUserPostLandingPage(body: any, headers: any): Promise<PostLandingResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }    

    let vids: string[] = [];
    let pics: string[] = [];
    let user: string[] = [];    

    let resVideo: PostData[] = [];        
    let resPic: PostData[] = [];        
    let resDiary: PostData[] = [];        
    let resStory: PostData[] = [];        

    body.postType = 'vid';
    body.withExp = false;
    let st = await this.utilService.getDateTimeDate();
    let postVid = await this.postPlaylistService.doGetUserPostPlaylistV2(body, headers, profile);
    let ed = await this.utilService.getDateTimeDate();
    let gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> video stopwatch 1: ' + gap);
    
    st = await this.utilService.getDateTimeDate();
    let pdv = await this.loadPostDataBulkV2(postVid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> video stopwatch 3: ' + gap);
    data.video = pdv;

    body.postType = 'pict';
    body.withExp = false;
    st = await this.utilService.getDateTimeDate();
    let postPid = await this.postPlaylistService.doGetUserPostPlaylistV2(body, headers, profile);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> pict stopwatch 1: ' + gap);

    st = await this.utilService.getDateTimeDate();    
    let pdp = await this.loadPostDataBulkV2(postPid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> pict stopwatch 3: ' + gap);    
    data.pict = pdp;    

    body.postType = 'diary';
    let postDid = await this.postPlaylistService.doGetUserPostPlaylistV2(body, headers, profile);
    //let pd = await this.loadBulk(postDid, page, row);
    let pdd = await this.loadPostDataBulkV2(postDid, body, profile, vids, pics);
    data.diary = pdd;        

    body.postType = 'story';
    body.withExp = false;
    st = await this.utilService.getDateTimeDate();    
    let postSid = await this.postPlaylistService.doGetUserPostPlaylistV2(body, headers, profile);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> story stopwatch 1: ' + gap);

    st = await this.utilService.getDateTimeDate();            
    let pds = await this.loadPostDataBulkV2(postSid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPage >>> story stopwatch 3: ' + gap);    
    data.story = pds;            


    //check apsara
    let xvids: string[] = [];
    let xpics: string[] = [];

    for (let i = 0; i < vids.length; i++) {
      let o = vids[i];
      if (o != undefined) {
        xvids.push(o);
      }
    }

    for (let i = 0; i < xpics.length; i++) {
      let o = xpics[i];
      if (o != undefined) {
        xpics.push(o);
      }
    }    

    let vapsara = undefined;
    let papsara = undefined;

    if (xvids.length > 0) {
      st = await this.utilService.getDateTimeDate();
      vapsara = await this.postContentService.getVideoApsara(xvids);
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();
      this.logger.log('getUserPostLandingPage >>> apsara video with : ' + xvids.length + " item is: " + gap);
    }

    if (xpics.length > 0) {
      st = await this.utilService.getDateTimeDate();    
      papsara = await this.postContentService.getImageApsara(xpics);  
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();      
      this.logger.log('getUserPostLandingPage >>> apsara image with : ' + xpics.length + " item is: " + gap);
    }

    if (vapsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (pds.length > 0) {
        for(let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pdss);
        }
      }      
      if (pdd.length > 0) {
        for(let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pddd);
        }
      }
    }

    if (papsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (pds.length > 0) {
        for(let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pdss);
        }
      }      
      if (pdd.length > 0) {
        for(let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pddd);
        }
      }
      if (pdp.length > 0) {
        for(let i = 0; i < pdp.length; i++) {
          let pdpp = pdd[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdpp.apsaraId == vi.VideoId) {
              pdpp.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resPic.push(pdpp);
        }
      }            
    }

    if (resVideo.length > 0) {
      data.video = resVideo;
    }

    if (resPic.length > 0) {
      data.pict = resPic;
    }

    if (resStory.length > 0) {
      data.story = resStory;
    }

    if (resDiary.length > 0) {
      data.diary = resDiary;
    }

    
    res.data = data;

    return res;
  }    

  async getUserPostLandingPageVPlay(body: any, headers: any): Promise<PostLandingResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPostLandingPageVPlay >>> profile: ' + profile);

    let res = new PostLandingResponseApps();
    let data = new PostLandingData();
    res.response_code = 202;

    let row = 20;
    let page = 0;
    if (body.pageNumber != undefined) {
      page = body.pageNumber;
    }
    if (body.pageRow != undefined) {
      row = body.pageRow;
    }    

    let vids: string[] = [];
    let pics: string[] = [];
    let user: string[] = [];    

    let resVideo: PostData[] = [];        
    let resPic: PostData[] = [];        
    let resDiary: PostData[] = [];        
    let resStory: PostData[] = [];        

    body.postType = 'vid';
    body.withExp = false;
    let st = await this.utilService.getDateTimeDate();
    let postVid = await this.postPlaylistService.doGetUserPostVPlaylist(body, headers, profile);
    let ed = await this.utilService.getDateTimeDate();
    let gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> video stopwatch 1: ' + gap);
    
    st = await this.utilService.getDateTimeDate();
    let pdv = await this.loadPostDataBulkV2(postVid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> video stopwatch 3: ' + gap);
    data.video = pdv;

    body.postType = 'pict';
    body.withExp = false;
    st = await this.utilService.getDateTimeDate();
    let postPid = await this.postPlaylistService.doGetUserPostVPlaylist(body, headers, profile);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> pict stopwatch 1: ' + gap);

    st = await this.utilService.getDateTimeDate();    
    let pdp = await this.loadPostDataBulkV2(postPid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> pict stopwatch 3: ' + gap);    
    data.pict = pdp;    

    body.postType = 'diary';
    let postDid = await this.postPlaylistService.doGetUserPostVPlaylist(body, headers, profile);
    //let pd = await this.loadBulk(postDid, page, row);
    let pdd = await this.loadPostDataBulkV2(postDid, body, profile, vids, pics);
    data.diary = pdd;        

    body.postType = 'story';
    body.withExp = true;
    st = await this.utilService.getDateTimeDate();    
    let postSid = await this.postPlaylistService.doGetUserPostVPlaylist(body, headers, profile);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> story stopwatch 1: ' + gap);

    st = await this.utilService.getDateTimeDate();            
    let pds = await this.loadPostDataBulkV2(postSid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPostLandingPageVPlay >>> story stopwatch 3: ' + gap);    
    data.story = pds;            


    //check apsara
    let xvids: string[] = [];
    let xpics: string[] = [];

    for (let i = 0; i < vids.length; i++) {
      let o = vids[i];
      if (o != undefined) {
        xvids.push(o);
      }
    }

    for (let i = 0; i < xpics.length; i++) {
      let o = xpics[i];
      if (o != undefined) {
        xpics.push(o);
      }
    }    

    let vapsara = undefined;
    let papsara = undefined;

    if (xvids.length > 0) {
      st = await this.utilService.getDateTimeDate();
      vapsara = await this.postContentService.getVideoApsara(xvids);
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();
      this.logger.log('getUserPostLandingPage >>> apsara video with : ' + xvids.length + " item is: " + gap);
    }

    if (xpics.length > 0) {
      st = await this.utilService.getDateTimeDate();    
      papsara = await this.postContentService.getImageApsara(xpics);  
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();      
      this.logger.log('getUserPostLandingPage >>> apsara image with : ' + xpics.length + " item is: " + gap);
    }

    if (vapsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (pds.length > 0) {
        for(let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pdss);
        }
      }      
      if (pdd.length > 0) {
        for(let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pddd);
        }
      }
    }

    if (papsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
      if (pds.length > 0) {
        for(let i = 0; i < pds.length; i++) {
          let pdss = pds[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdss.apsaraId == vi.VideoId) {
              pdss.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pdss);
        }
      }      
      if (pdd.length > 0) {
        for(let i = 0; i < pdd.length; i++) {
          let pddd = pdd[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pddd.apsaraId == vi.VideoId) {
              pddd.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resStory.push(pddd);
        }
      }
      if (pdp.length > 0) {
        for(let i = 0; i < pdp.length; i++) {
          let pdpp = pdd[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdpp.apsaraId == vi.VideoId) {
              pdpp.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resPic.push(pdpp);
        }
      }            
    }

    if (resVideo.length > 0) {
      data.video = resVideo;
    }

    if (resPic.length > 0) {
      data.pict = resPic;
    }

    if (resStory.length > 0) {
      data.story = resStory;
    }

    if (resDiary.length > 0) {
      data.diary = resDiary;
    }

    
    res.data = data;

    return res;
  }    

  async getUserPost(body: any, headers: any): Promise<PostResponseApps> {

    let type = 'GET_POST';
    var token = headers['x-auth-token'];
    var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    var profile = await this.userService.findOne(auth.email);
    this.logger.log('getUserPost >>> profile: ' + profile);

    let res = new PostResponseApps();
    res.response_code = 202;

    let vids: string[] = [];
    let pics: string[] = [];

    let resVideo: PostData[] = [];        

    let st = await this.utilService.getDateTimeDate();
    let postVid = await this.postPlaylistService.doGetUserPostPlaylistV2(body, headers, profile);
    let ed = await this.utilService.getDateTimeDate();
    let gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPost >>> video stopwatch 1: ' + gap);
    
    st = await this.utilService.getDateTimeDate();
    let pdv = await this.loadPostDataBulkV2(postVid, body, profile, vids, pics);
    ed = await this.utilService.getDateTimeDate();
    gap = ed.getTime() - st.getTime();
    this.logger.log('getUserPost >>> video stopwatch 3: ' + gap);

    res.data = pdv;


    //check apsara
    let xvids: string[] = [];
    let xpics: string[] = [];

    for (let i = 0; i < vids.length; i++) {
      let o = vids[i];
      if (o != undefined) {
        xvids.push(o);
      }
    }

    for (let i = 0; i < xpics.length; i++) {
      let o = xpics[i];
      if (o != undefined) {
        xpics.push(o);
      }
    }    

    let vapsara = undefined;
    let papsara = undefined;

    if (xvids.length > 0) {
      st = await this.utilService.getDateTimeDate();
      vapsara = await this.postContentService.getVideoApsara(xvids);
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();
      this.logger.log('getUserPostLandingPage >>> apsara video with : ' + xvids.length + " item is: " + gap);
    }

    if (xpics.length > 0) {
      st = await this.utilService.getDateTimeDate();    
      papsara = await this.postContentService.getImageApsara(xpics);  
      ed = await this.utilService.getDateTimeDate();
      gap = ed.getTime() - st.getTime();      
      this.logger.log('getUserPostLandingPage >>> apsara image with : ' + xpics.length + " item is: " + gap);
    }

    if (vapsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < vapsara.VideoList.length; i++) {
            let vi = vapsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
    }

    if (papsara != undefined) {
      if (pdv.length > 0) {
        for(let i = 0; i < pdv.length; i++) {
          let pdvv = pdv[i];
          for (let i = 0; i < papsara.VideoList.length; i++) {
            let vi = papsara.VideoList[i];
            if (pdvv.apsaraId == vi.VideoId) {
              pdvv.mediaThumbEndpoint = vi.CoverURL;
            }
          }
          resVideo.push(pdvv);
        }
      }
    }

    if (resVideo.length > 0) {
      res.data = resVideo;
    }

    return res;
  }      

  private async loadPostDataBulkV2(posts: Userplaylist[], body: any, iam: Userbasic, xvids: string[], xpics: string[]): Promise<PostData[]> {
    //this.logger.log('doGetUserPostPlaylist >>> start: ' + JSON.stringify(posts));
    let pd = Array<PostData>();
    if (posts != undefined) {

      for (let i = 0; i < posts.length; i++) {
        let ps = posts[i];
        let pa = new PostData();

        let post = <Posts> ps.postData;

        pa.active = (ps.isHidden == false);
        pa.allowComments = post.allowComments;
        pa.certified = post.certified;
        pa.createdAt = String(post.createdAt);
        pa.updatedAt = String(post.updatedAt);
        pa.description = String(post.description);
        pa.email = String(post.email);
        pa.postType = String(ps.postType);

        //let following = await this.contentEventService.findFollowing(pa.email);

        if (ps.userBasicData != undefined) {
          let ub = <Userbasic> ps.userBasicData;
          pa.avatar = await this.postContentService.getProfileAvatar(ub);
        }

        pa.isApsara = false;
        pa.location = post.location;
        pa.visibility = String(post.visibility);

        if (post.metadata != undefined) {
          let md = post.metadata;
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


        pa.postID = String(post.postID);
        pa.postType = String(post.postType);
        pa.saleAmount = post.saleAmount;
        pa.saleLike = post.saleLike;
        pa.saleView = post.saleView;

        if (post.tagPeople != undefined && post.tagPeople.length > 0) {
          let atp = post.tagPeople;
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
                  tp1.avatar = await this.postContentService.getProfileAvatar(ub);
                }

                //tp1.status = 'TOFOLLOW';
                //if (tp1.email == pa.email) {
                //  tp1.status = "UNLINK";
                //} else {
                //  for (let i = 0; i < following.length; i++) {
                //    let fol = following[i];
                //    if (fol.email == tp1.email) {
                //      tp1.status = "FOLLOWING";
                //    }
                //  }
                //}
                atp1.push(tp1);
              }
            }
          }

          pa.tagPeople = atp1;
        }

        if (post.category != undefined && post.category.length > 0) {
          let atp = post.category;
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

        pa.tags = post.tags;

        //Insight

        if ((body.withInsight != undefined && (body.withInsight == true || body.withInsight == 'true'))) {
          let insight = await this.insightService.findemail(String(post.email));
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
        let meds = <MediaData> ps.mediaData;
        if (ps.postType == 'vid') {
          if (meds.apsara == true) {
            xvids.push(String(meds.apsaraId));
            pa.apsaraId = String(meds.apsaraId);
            pa.isApsara = true;
          } else {
            pa.mediaThumbUri = ps.mediaThumbUri;
            pa.mediaEndpoint = String(ps.mediaEndpoint);
            pa.mediaThumbEndpoint = String(ps.mediaThumbEndpoint);
          }
          pa.mediaType = 'video';
        } else if (ps.postType == 'pict') {
          if (meds.apsara == true) {
            xpics.push(String(meds.apsaraId));
            pa.apsaraId = String(meds.apsaraId);
            pa.isApsara = true;
          } else {
            pa.mediaThumbUri = ps.mediaThumbUri;
            pa.mediaEndpoint = String(ps.mediaEndpoint);
            pa.mediaThumbEndpoint = String(ps.mediaThumbEndpoint);            
          }
          pa.mediaType = 'image';
        } else if (ps.postType == 'diary') {
          if (meds.apsara == true) {
            xvids.push(String(meds.apsaraId));
            pa.apsaraId = String(meds.apsaraId);
            pa.isApsara = true;
          } else {
            pa.mediaThumbUri = ps.mediaThumbUri;
            pa.mediaEndpoint = String(ps.mediaEndpoint);
            pa.mediaThumbEndpoint = String(ps.mediaThumbEndpoint);
          }
          pa.mediaType = 'video';
        } else if (ps.postType == 'story') {
          if (meds.mediaType == 'video') {
            if (meds.apsara == true) {
              xvids.push(String(meds.apsaraId));
              pa.apsaraId = String(meds.apsaraId);
              pa.isApsara = true;
            } else {
              pa.mediaThumbUri = ps.mediaThumbUri;
              pa.mediaEndpoint = String(ps.mediaEndpoint);
              pa.mediaThumbEndpoint = String(ps.mediaThumbEndpoint);
            }  
            pa.mediaType = 'video';          
          } else {
            if (meds.apsara == true) {
              xpics.push(String(meds.apsaraId));
              pa.apsaraId = String(meds.apsaraId);
              pa.isApsara = true;
            } else {
              pa.mediaThumbUri = ps.mediaThumbUri;
              pa.mediaEndpoint = String(ps.mediaEndpoint);
              pa.mediaThumbEndpoint = String(ps.mediaThumbEndpoint);            
            }      
            pa.mediaType = 'image';      
          }
        }

        pa.isViewed = false;
        /*
        if (pa.viewers != undefined && pa.viewers.length > 0) {
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
        */

        /*
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
        */
        pd.push(pa);
      }
    }
    return pd;
  }    
}