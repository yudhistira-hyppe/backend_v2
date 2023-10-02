import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateNewPostDTO, CreatenewPost2Dto } from './dto/create-newPost.dto';
import { NewpostsSchema } from './schemas/newPost.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler'; 
import { AvatarDTO, ProfileDTO } from 'src/utils/data/Profile';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';
import { LogapisService } from 'src/trans/logapis/logapis.service';
import { TagPeople } from '../posts/dto/create-posts.dto'; 
import { PostContentService } from '../posts/postcontent.service';

@Controller('api/post/v3')
export class NewPostController {
  constructor(private readonly newPostService: NewPostService,
    private readonly utilsService:UtilsService,
    private readonly basic2SS:UserbasicnewService,
    private readonly errorHandler:ErrorHandler,
    private readonly getcontenteventsService:ContenteventsService,
    private readonly logapiSS:LogapisService,
    private readonly postContentService:PostContentService,
    ) { }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('viewlike')
  async getViewLike2(
      @Body() CreateGetcontenteventsDto_: CreatenewPost2Dto,
      @Headers() headers
  ) {
      if (!(await this.utilsService.validasiTokenEmail(headers))) {
          await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed token and email not match',
          );
      }

      if (CreateGetcontenteventsDto_.postID == undefined) {
          await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed postID is required',
          );
      }

      if (CreateGetcontenteventsDto_.eventType == undefined) {
          await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed eventType is required',
          );
      }

      //Ceck POST ID
      const datapostsService = await this.newPostService.findOne(
          CreateGetcontenteventsDto_.postID.toString(),
      );
      if (await this.utilsService.ceckData(datapostsService)) {
          CreateGetcontenteventsDto_.receiverParty = datapostsService.email;
          CreateGetcontenteventsDto_.active = true;
          var data_contentevents = null;
          if(CreateGetcontenteventsDto_.eventType == "LIKE")
          {
            data_contentevents = datapostsService.userLike;
          }
          else
          {
            data_contentevents = datapostsService.userView;
          }
          
          var data_response = [];
          if (await this.utilsService.ceckData(data_contentevents)) {
              if (data_contentevents.length > 0) {
                  var start = (parseInt(CreateGetcontenteventsDto_.skip.toString())) * parseInt(CreateGetcontenteventsDto_.limit.toString());
                  var end = (parseInt(CreateGetcontenteventsDto_.skip.toString()) + 1) * parseInt(CreateGetcontenteventsDto_.limit.toString());
                  for (var i = start; i < end; i++) {
                      const data_profile = await this.basic2SS.finddetail(data_contentevents[i].toString());
                      var ProfileDTO_ = new ProfileDTO();
                      ProfileDTO_.fullName = data_profile.fullName;
                      ProfileDTO_.email = data_profile.email;
                      ProfileDTO_.username = data_profile.username;
                      ProfileDTO_.urluserBadge = data_profile.urluserBadge;
                      var AvatarDTO_ = new AvatarDTO();
                      if(data_profile.mediaBasePath != null || data_profile.mediaUri != null || data_profile.mediaType != null || data_profile.mediaEndpoint != null){
                          if (data_profile.mediaBasePath != undefined) {
                              AvatarDTO_.mediaBasePath = data_profile.mediaBasePath;
                          }
                          if (data_profile.mediaUri != undefined) {
                              AvatarDTO_.mediaUri = data_profile.mediaUri;
                          }
                          if (data_profile.mediaType != undefined) {
                              AvatarDTO_.mediaType = data_profile.mediaType;
                          }
                          if (data_profile.mediaEndpoint != undefined) {
                              AvatarDTO_.mediaEndpoint = data_profile.mediaEndpoint;
                              var mediaEndpoint = data_profile.mediaEndpoint;
                              AvatarDTO_.profilePict_id = mediaEndpoint.replace("/profilepict/", "");
                          }
                          ProfileDTO_.avatar = AvatarDTO_;
                      } else {
                          ProfileDTO_.avatar = null;
                      }
                      data_response.push(ProfileDTO_);
                  }
              }
          }
          var response = {
              "response_code": 202,
              "data": data_response,
              "messages": {
                  "info": [
                      "successfully"
                  ]
              },
          }
          return response;
      } else {
          await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed postID not found',
          );
      }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('tagpeople')
  async tagpeople(@Headers() headers, @Body() body) {
    var timestamps_start = await this.utilsService.getDateTimeString();
    var fullurl = headers.host + "/api/post/v3/tagpeople";
    var reqbody = JSON.parse(JSON.stringify(body));

    //CECK BAEARER TOKEN
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, null, null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed token and email not match',
      );
    }

    //CECK DATA USER
    const data_userbasic = await this.basic2SS.findbyemail(headers['x-auth-user']);
    if (!(await this.utilsService.ceckData(data_userbasic))) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed User not found'
      );
    }

    if (body.postId == undefined) {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Param PostID required'
      );
    }

    var userEmail = headers['x-auth-user'];
    var post = await this.newPostService.findOne(body.postId.toString());
    // let following = await this.getcontenteventsService.findFollowing(userEmail);
    if (await this.utilsService.ceckData(post)) {
      if (post.tagPeople != undefined && post.tagPeople.length > 0) {
        let atp = post.tagPeople;
        let atp1 = Array<TagPeople>();

        for (let x = 0; x < atp.length; x++) {
          let tp = atp[x];
          if (tp?.namespace) {
            let oid = tp.oid;
            let ua = await this.basic2SS.findbyidauth(oid.toString());
            if (ua != undefined) {
              let tp1 = new TagPeople();
              tp1.email = String(ua.email);
              tp1.username = String(ua.username);

              let ub = await this.basic2SS.finddetail(String(ua.email));
              if (ub != undefined) {
                var tempprofile = tp1.avatar;
                try
                {
                    if(ub.mediaBasePath != null || ub.mediaUri != null || ub.mediaType != null || ub.mediaEndpoint != null)
                    {
                        tempprofile.mediaBasePath = ub.mediaBasePath;
                        tempprofile.mediaUri = ub.mediaUri;
                        tempprofile.mediaType = ub.mediaType;
                        tempprofile.mediaEndpoint = ub.mediaEndpoint;
                    }

                    tp1.avatar = tempprofile;
                }
                catch(e)
                {

                }

                if (await this.utilsService.ceckData(ub.urluserBadge)) {
                  tp1.urluserBadge = ub.urluserBadge;
                }
                else {
                  tp1.urluserBadge = null;
                }
              }

              tp1.status = 'TOFOLLOW';
              if (tp1.email == userEmail) {
                tp1.status = "UNLINK";
              } else {
                var ceck_data_FOLLOWER = await this.getcontenteventsService.ceckData(tp1.email, "FOLLOWER", "ACCEPT", userEmail, "", "");
                if (await this.utilsService.ceckData(ceck_data_FOLLOWER)) {
                  if (ceck_data_FOLLOWER.active) {
                    tp1.status = "FOLLOWING";
                  }
                }
              }
              atp1.push(tp1);
            }
          }
        }

        var timestamps_end = await this.utilsService.getDateTimeString();
        this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

        return {
          response_code: 202,
          data: atp1,
          messages: {
            info: ['successfuly'],
          },
        };
      }
    } else {
      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, headers['x-auth-user'], null, null, reqbody);

      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Data Post not found'
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('database')
  async finddata3(@Req() request, @Headers() headers): Promise<any> {
      var timestamps_start = await this.utilsService.getDateTimeString();
      var fullurl = request.get("Host") + request.originalUrl;
      var token = headers['x-auth-token'];
      var auth = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      var email = auth.email;

      const messages = {
          "info": ["The process successful"],
      };

      var request_json = JSON.parse(JSON.stringify(request.body));
      var page = null;
      var startdate = null;
      var enddate = null;
      var limit = null;
      var totalpage = 0;
      var totalallrow = 0;
      var totalsearch = 0;
      var total = 0;
      var username = null;
      var kepemilikan = [];
      var statusjual = [];
      var data = [];
      var description = null;
      var postType = [];
      var kategori = [];
      var startmount = null;
      var endmount = null;
      var descending = null;
      var iduser = null;
      var buy = null;
      var reported = null;
      var popular = null;
      var hashtag = null;
      var userid = null;
      const mongoose = require('mongoose');
      var ObjectId = require('mongodb').ObjectId;
      if (request_json["limit"] !== undefined) {
          limit = request_json["limit"];
      } else {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("Unabled to proceed");
      }
      if (request_json["page"] !== undefined) {
          page = request_json["page"];
      } else {
          var timestamps_end = await this.utilsService.getDateTimeString();
          this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);

          throw new BadRequestException("Unabled to proceed");
      }

      startdate = request_json["startdate"];
      enddate = request_json["enddate"];
      username = request_json["username"];
      description = request_json["description"];
      kepemilikan = request_json["kepemilikan"];
      statusjual = request_json["statusjual"];
      postType = request_json["postType"];
      kategori = request_json["kategori"];
      startmount = request_json["startmount"];
      endmount = request_json["endmount"];
      descending = request_json["descending"];
      buy = request_json["buy"];
      reported = request_json["reported"];
      popular = request_json["popular"];
      hashtag = request_json["hashtag"];
      if (request_json["limit"] !== undefined) {
          iduser = request_json["iduser"];
          userid = mongoose.Types.ObjectId(iduser);
      }
      var query = null;
      var datasearch = null;
      var dataall = null;

      if (iduser !== undefined) {
          try {
              query = await this.newPostService.databasenew(buy, reported, userid, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
              data = query;
          } catch (e) {
              query = null;
              data = [];
          }
      } else {
          try {
              query = await this.newPostService.databasenew(buy, reported, undefined, username, description, kepemilikan, statusjual, postType, kategori, hashtag, startdate, enddate, startmount, endmount, descending, page, limit, popular);
              data = query;
          } catch (e) {
              query = null;
              data = [];
          }
      }

      var timestamps_end = await this.utilsService.getDateTimeString();
      this.logapiSS.create2(fullurl, timestamps_start, timestamps_end, email, null, null, request_json);


      return { response_code: 202, data, page, limit, total, totalallrow, totalsearch, totalpage, messages };
  }
}
