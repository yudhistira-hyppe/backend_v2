import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Post, Body, Headers } from '@nestjs/common';
import { NewPostService } from './new_post.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateNewPostDTO, CreatenewPost2Dto } from './dto/create-newPost.dto';
import { NewpostsSchema } from './schemas/newPost.schema';
import { UtilsService } from 'src/utils/utils.service';
import { ErrorHandler } from 'src/utils/error.handler'; 
import { AvatarDTO, ProfileDTO } from 'src/utils/data/Profile';
import { ContenteventsService } from '../contentevents/contentevents.service';
import { UserbasicnewService } from 'src/trans/userbasicnew/userbasicnew.service';

@Controller('api/post/v3')
export class NewPostController {
  constructor(private readonly newPostService: NewPostService,
    private readonly utilsService:UtilsService,
    private readonly basic2SS:UserbasicnewService,
    private readonly errorHandler:ErrorHandler,
    private readonly getcontenteventsService:ContenteventsService) { }

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
}
