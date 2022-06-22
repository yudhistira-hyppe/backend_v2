import { Injectable, NotAcceptableException } from '@nestjs/common';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { CountriesService } from '../infra/countries/countries.service';
import { LanguagesService } from '../infra/languages/languages.service';
import { MediaprofilepictsService } from '../content/mediaprofilepicts/mediaprofilepicts.service';
import { InsightsService } from '../content/insights/insights.service';
import { InterestsService } from '../infra/interests/interests.service';
import { InterestsRepoService } from '../infra/interests_repo/interests_repo.service';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { CreateActivityeventsDto } from 'src/trans/activityevents/dto/create-activityevents.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AnyArray } from 'mongoose';

var randtoken = require('rand-token');

@Injectable()
export class AuthService {
  constructor(
    private userauthsService: UserauthsService,
    private jwtService: JwtService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private countriesService: CountriesService,
    private languagesService: LanguagesService,
    private mediaprofilepictsService: MediaprofilepictsService,
    private insightsService: InsightsService,
    private interestsService: InterestsService,
    private interestsRepoService: InterestsRepoService,
    private activityeventsService: ActivityeventsService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    var isMatch = false;
    try {
      const user_userbasics = await this.userbasicsService.findOne(email);
      const user_jwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
        email,
      );
      const user_auths = await this.userauthsService.findOne(email);

      if (!!!user_jwtrefreshtoken) {
        await this.generateRefreshToken(email);
      }
      if (!!user_auths) {
        const passuser = user_auths.password;
        isMatch = await bcrypt.compare(pass, passuser);
      } else {
        return 'NOTFOUND';
      }
      if (!!user_userbasics && isMatch) {
        const { password, ...result } = user_auths;
        return result;
      } else {
        return 'INVALIDCREDENTIALSLID';
      }
    } catch (err) {
      return 'UNABLEDTOPROCEED';
    }
  }

  async login(req: any) {
    try {
      var user_email = req.body.email;
      var user_location = req.body.location;
      var user_deviceId = req.body.deviceId;
      var current_date = new Date().toISOString().replace('T', ' ');

      var data_CreateActivityeventsDto_parent = new CreateActivityeventsDto();
      var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
      var ID_parent_ActivityEvent = (await this.generateId()).toLowerCase();
      var ID_child_ActivityEvent = (await this.generateId()).toLowerCase();

      var data_CreateUserdeviceDto = new CreateUserdeviceDto();
      var ID_user_userdevicesService = null;

      //Ceck User ActivityEvent Parent
      const user_activityevents =
        await this.activityeventsService.findParentByDevice(
          user_email,
          user_deviceId,
          'LOGIN',
          false,
        );

      //Ceck User Userdevices
      const user_userdevicesService =
        await this.userdevicesService.findOneEmail(user_email, user_deviceId);

      //Ceck User Userauths
      const datauserauthsService = await this.userauthsService.findOneByEmail(
        user_email,
      );

      //Ceck User Userbasics
      const datauserbasicsService = await this.userbasicsService.findOne(
        user_email,
      );

      //Ceck User jwtrefresh token
      const datajwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
        user_email,
      );

      //ActivityEvent Parent > 0
      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent child
        try {
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'INITIAL';
          data_CreateActivityeventsDto_child.target = 'ACTIVE';
          data_CreateActivityeventsDto_child.event = 'AWAKE';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: user_location.latitude,
              longitude: user_location.longitude,
            },
            logout_date: null,
            login_date: current_date.substring(
              0,
              current_date.lastIndexOf('.'),
            ),
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          data_CreateActivityeventsDto_child.updatedAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          data_CreateActivityeventsDto_child.sequenceNumber = '0';
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;

          //Insert ActivityEvent child
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (err_create_activity_event_child) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Activity events Child. Error:' +
                err_create_activity_event_child,
              ],
            },
          });
        }

        //Update ActivityEvent Parent
        try {
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push({
            $ref: 'activityevents',
            $id: new Object(ID_child_ActivityEvent),
            $db: 'hyppe_trans_db',
          });

          //Update ActivityEvent Parent
          const update_activityevents_parent =
            await this.activityeventsService.update(
              {
                _id: user_activityevents[0]._id.toString(),
              },
              {
                transitions: data_transitions,
              },
            );
        } catch (err_update_activity_event_parent) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Update Activity events Parent. Error:' +
                err_update_activity_event_parent,
              ],
            },
          });
        }
      } else {
        //Create ActivityEvent Parent
        try {
          data_CreateActivityeventsDto_parent.activityEventID =
            ID_parent_ActivityEvent;
          data_CreateActivityeventsDto_parent.activityType = 'LOGIN';
          data_CreateActivityeventsDto_parent.active = true;
          data_CreateActivityeventsDto_parent.status = 'INITIAL';
          data_CreateActivityeventsDto_parent.target = 'USER_LOGOUT';
          data_CreateActivityeventsDto_parent.event = 'LOGIN';
          data_CreateActivityeventsDto_parent.payload = {
            login_location: {
              latitude: user_location.latitude,
              longitude: user_location.longitude,
            },
            logout_date: null,
            login_date: current_date.substring(
              0,
              current_date.lastIndexOf('.'),
            ),
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_parent.createdAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_parent.updatedAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_parent.sequenceNumber = '1';
          data_CreateActivityeventsDto_parent.flowIsDone = false;
          data_CreateActivityeventsDto_parent.transitions = [
            {
              $ref: 'activityevents',
              $id: Object(ID_child_ActivityEvent),
              $db: 'hyppe_trans_db',
            },
          ];

          //Insert ActivityEvent Parent
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_parent,
          );
        } catch (err_create_activity_event_parent) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Activity events Parent. Error: ' +
                err_create_activity_event_parent,
              ],
            },
          });
        }

        //Create ActivityEvent child
        try {
          var data_CreateActivityeventsDto_child =
            new CreateActivityeventsDto();

          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'INITIAL';
          data_CreateActivityeventsDto_child.target = 'ACTIVE';
          data_CreateActivityeventsDto_child.event = 'AWAKE';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: user_location.latitude,
              longitude: user_location.longitude,
            },
            logout_date: null,
            login_date: current_date.substring(
              0,
              current_date.lastIndexOf('.'),
            ),
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          data_CreateActivityeventsDto_child.updatedAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          data_CreateActivityeventsDto_child.sequenceNumber = '0';
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            ID_parent_ActivityEvent;

          //Insert ActivityEvent Parent
          const insert_activityevents_child =
            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );
        } catch (err_create_activity_event_child) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Activity events Child. Error: ' +
                err_create_activity_event_child,
              ],
            },
          });
        }
      }

      //Userdevices != null
      if (user_userdevicesService != null) {
        //Get Userdevices
        try {
          await this.userdevicesService.updatebyEmail(
            user_email,
            user_deviceId,
            {
              active: true,
            },
          );
          ID_user_userdevicesService = user_userdevicesService._id;
        } catch (err_get_userdevices) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Get Userdevices. Error:' +
                err_get_userdevices,
              ],
            },
          });
        }
      } else {
        //Create Userdevices
        try {
          ID_user_userdevicesService = (await this.generateId()).toLowerCase();
          data_CreateUserdeviceDto._id = ID_user_userdevicesService;
          data_CreateUserdeviceDto.deviceID = user_deviceId;
          data_CreateUserdeviceDto.email = user_email;
          data_CreateUserdeviceDto.active = true;
          data_CreateUserdeviceDto.createdAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          data_CreateUserdeviceDto.updatedAt = current_date.substring(
            0,
            current_date.lastIndexOf('.'),
          );
          //Insert User Userdevices
          await this.userdevicesService.create(data_CreateUserdeviceDto);
        } catch (err_create_userdevices) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Userdevices. Error:' +
                err_create_userdevices,
              ],
            },
          });
        }
      }

      //Update Devices Userauths
      try {
        //Get Devices Userauths
        const datauserauthsService_devices = datauserauthsService.devices;

        //Filter ID_user_userdevicesService Devices UserDevices
        var filteredData = datauserauthsService_devices.filter(function (
          datauserauthsService_devices,
        ) {
          return (
            JSON.parse(JSON.stringify(datauserauthsService_devices)).$id ===
            ID_user_userdevicesService
          );
        });

        if (filteredData.length == 0) {
          //Pust Devices Userauths
          datauserauthsService_devices.push({
            $ref: 'userdevices',
            $id: ID_user_userdevicesService,
            $db: 'hyppe_trans_db',
          });

          await this.userauthsService.updatebyEmail(user_email, {
            devices: datauserauthsService_devices,
          });
        }
      } catch (err_update_devices_userauths) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: [
              'Unabled to proceed Update Devices Userauths. Error:' +
              err_update_devices_userauths,
            ],
          },
        });
      }

      var countries_json = JSON.parse(
        JSON.stringify(datauserbasicsService.countries),
      );
      var languages_json = JSON.parse(
        JSON.stringify(datauserbasicsService.languages),
      );
      var mediaprofilepicts_json = JSON.parse(
        JSON.stringify(datauserbasicsService.profilePict),
      );
      var insights_json = JSON.parse(
        JSON.stringify(datauserbasicsService.insight),
      );

      var interests_array = [];
      if (datauserbasicsService.userInterests.length > 0) {
        for (let i = 0; i < datauserbasicsService.userInterests.length; i++) {
          var interests_json = JSON.parse(
            JSON.stringify(datauserbasicsService.userInterests[i]),
          );
          if (interests_json.$ref == 'interests_repo') {
            const interests = await this.interestsRepoService.findOne(
              interests_json.$id,
            );
            interests_array[i] = interests.interestName;
          } else {
            const interests = await this.interestsService.findOne(
              interests_json.$id,
            );
            interests_array[i] = interests.interestName;
          }
        }
      }

      const countries = await this.countriesService.findOne(countries_json.$id);
      const languages = await this.languagesService.findOne(languages_json.$id);
      const mediaprofilepicts = await this.mediaprofilepictsService.findOne(
        mediaprofilepicts_json.$id,
      );
      const insights = await this.insightsService.findOne(insights_json.$id);

      var mediaUri = mediaprofilepicts.mediaUri;
      let result = '/profilepict/' + mediaUri.replace('_0001.jpeg', '');
      var mediaprofilepicts_res = {
        mediaBasePath: mediaprofilepicts.mediaBasePath,
        mediaUri: mediaprofilepicts.mediaUri,
        mediaType: mediaprofilepicts.mediaType,
        mediaEndpoint: result,
      };

      var insights_res = {
        shares: insights.shares,
        followers: insights.followers,
        comments: insights.comments,
        followings: insights.followings,
        reactions: insights.reactions,
        posts: insights.posts,
        views: insights.views,
        likes: insights.likes,
      };

      const messages = {
        info: ['Device activity logging successful'],
      };
      var token = (
        await this.generateToken(user_email, user_deviceId)
      ).toString();
      const data = {
        country: countries.country,
        idProofNumber: datauserbasicsService.idProofNumber,
        roles: datauserauthsService.roles,
        fullName: datauserbasicsService.fullName,
        avatar: mediaprofilepicts_res,
        isIdVerified: datauserbasicsService.isIdVerified,
        isEmailVerified: datauserauthsService.isEmailVerified,
        token: 'Bearer ' + token,
        idProofStatus: datauserbasicsService.idProofStatus,
        insight: insights_res,
        langIso: languages.langIso,
        interest: interests_array,
        event: datauserbasicsService.event,
        email: datauserbasicsService.email,
        username: datauserauthsService.username,
        isComplete: datauserbasicsService.isComplete,
        status: datauserbasicsService.status,
        refreshToken: datajwtrefreshtoken.refresh_token_id,
      };
      return {
        response_code: 202,
        data,
        messages,
      };
    } catch (err_login) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed Login. Error:' + err_login],
        },
      });
    }
  }

  async refreshToken(email: string, refresh_token_id: string) {
    const datajwtrefreshtokenService =
      await this.jwtrefreshtokenService.findByEmailRefreshToken(
        email,
        refresh_token_id,
      );

    const datauserbasicsService = await this.userbasicsService.findOne(email);
    if (!!datajwtrefreshtokenService) {
      var date_exp = await datajwtrefreshtokenService.exp;
      if (new Date().getTime() < Number(await date_exp)) {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Refesh token still valid'],
          },
        });
      } else {
        //Ceck User Userauths
        const datauserauthsService =
          await this.userauthsService.findOneByEmail(email);

        //Get Id Userdevices
        const datauserauthsService_devices =
          datauserauthsService.devices[
          datauserauthsService.devices.length - 1
          ];

        //Ceck Userdevices
        const datauserdevices = await this.userdevicesService.findOneId(
          Object(datauserauthsService_devices.oid),
        );

        var Token =
          'Bearer ' +
          (await this.generateToken(
            datauserbasicsService.email.toString(),
            datauserbasicsService._id.toString(),
          ));
        var RefreshToken = await this.generateRefreshToken(
          datauserbasicsService.email.toString(),
        );
        return {
          response_code: 202,
          data: {
            token: Token.toString(),
            refreshToken: RefreshToken.toString(),
          },
          messages: {
            info: ['Refresh Token successful'],
          },
        };
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
  }

  async generateToken(email: string, deviceId: string) {
    const payload = {
      email: email,
      deviceId: deviceId,
    };
    return this.jwtService.sign(payload);
  }

  async generateRefreshToken(email: string): Promise<string> {
    try {
      // Public Domain/MIT
      var d = new Date().getTime(); //Timestamp
      var d2 =
        (typeof performance !== 'undefined' &&
          performance.now &&
          performance.now() * 1000) ||
        0; //Time in microseconds since page-load or 0 if unsupported
      var refreshToken = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        function (c) {
          var r = Math.random() * 16; //random number between 0 and 16
          if (d > 0) {
            //Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
          } else {
            //Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
          }
          return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
        },
      );
      var iatdate = new Date();
      var expdate = new Date();
      expdate.setDate(
        expdate.getDate() +
        Number(process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME),
      );
      console.log('asdasdas' + iatdate.getTime());
      await this.jwtrefreshtokenService.saveorupdateRefreshToken(
        refreshToken,
        email,
        expdate.getTime(),
        iatdate.getTime(),
      );
      return refreshToken;
    } catch (err_login) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed Update Refresh Token. Error:' + err_login],
        },
      });
    }
  }

  async generateId(): Promise<string> {
    var _id =
      randtoken.generate(8) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(4) +
      '-' +
      randtoken.generate(12);
    return _id;
  }

  async logout(req: any, head: any): Promise<any> {
    req.logout();
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_deviceId = req.body.deviceId;
    var current_date = new Date().toISOString().replace('T', ' ');
    var ID_child_ActivityEvent = (await this.generateId()).toLowerCase();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
    if (user_email_header != user_email) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }

    const user_activityevents =
      await this.activityeventsService.findParentByDevice(
        user_email,
        user_deviceId,
        'LOGIN',
        false,
      );

    const user_userdevicesService =
      await this.userdevicesService.findOneEmail(user_email, user_deviceId);

    const user_userbasics = await this.userbasicsService.findOne(user_email);
    if (!!user_userbasics) {
      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'LOGIN';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'USER_LOGOUT';
          data_CreateActivityeventsDto_child.target = 'COMPLETE';
          data_CreateActivityeventsDto_child.event = 'LOGOUT';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude:
                user_activityevents[0].payload.login_location.latitude,
              longitude:
                user_activityevents[0].payload.login_location.longitude,
            },
            logout_date: current_date.substring(
              0,
              current_date.lastIndexOf('.'),
            ),
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_child.updatedAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_child.sequenceNumber = '0';
          data_CreateActivityeventsDto_child.flowIsDone = true;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          const insert_activityevents_child =
            await this.activityeventsService.create(
              data_CreateActivityeventsDto_child,
            );
        } catch (err_create_activity_events_child) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Activity Event Child. Error:' +
                err_create_activity_events_child,
              ],
            },
          });
        }

        //Update ActivityEvent Parent
        try {
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push(
            'DBRef("activityevents", "' +
            ID_child_ActivityEvent +
            '","hyppe_trans_db")',
          );
          const update_activityevents_parent =
            await this.activityeventsService.update(
              {
                _id: user_activityevents[0]._id.toString(),
              },
              {
                payload: {
                  login_location: {
                    latitude:
                      user_activityevents[0].payload.login_location.latitude,
                    longitude:
                      user_activityevents[0].payload.login_location.longitude,
                  },
                  logout_date: current_date.substring(
                    0,
                    current_date.lastIndexOf('.'),
                  ),
                  login_date: user_activityevents[0].payload.login_date,
                  login_device: user_deviceId,
                  email: user_email,
                },
                flowIsDone: true,
                transitions: data_transitions,
              },
            );
        } catch (err_update_activity_events_parent) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Update Activity Event Parent. Error:' +
                err_update_activity_events_parent,
              ],
            },
          });
        }

        //Update Userdevices
        try {
          if (user_userdevicesService != null) {
            const datauserauthsService =
              await this.userdevicesService.updatebyEmail(
                user_email,
                user_deviceId,
                {
                  active: false,
                },
              );
          }
          return {
            response_code: 202,
            messages: {
              info: ['Logout successful'],
            },
          };
        } catch (err_update_userdevices) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Update Userdevices. Error:' +
                err_update_userdevices,
              ],
            },
          });
        }
      } else {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed'],
          },
        });
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['User not found'],
        },
      });
    }
  }

  async deviceactivity(req: any, head: any): Promise<any> {
    var user_email_header = head['x-auth-user'];
    var user_email = req.body.email;
    var user_deviceId = req.body.deviceId;
    var user_event = req.body.event;
    var user_status = req.body.status;
    var current_date = new Date().toISOString().replace('T', ' ');

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();
    var ID_child_ActivityEvent = (await this.generateId()).toLowerCase();

    if (user_email_header != user_email) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }
    if (
      !((user_event == 'AWAKE' && user_status == 'INITIAL') ||
        (user_event == 'SLEEP' && user_status == 'ACTIVE'))
    ) {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['Unabled to proceed'],
        },
      });
    }

    const user_userbasics = await this.userbasicsService.findOne(user_email);
    if (!!user_userbasics) {
      //Ceck User ActivityEvent Parent
      const user_activityevents =
        await this.activityeventsService.findParentByDevice(
          user_email,
          user_deviceId,
          'LOGIN',
          false,
        );

      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType =
            'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = user_status;
          data_CreateActivityeventsDto_child.target = 'ACTIVE';
          data_CreateActivityeventsDto_child.event = user_event;
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude:
                user_activityevents[0].payload.login_location.latitude,
              longitude:
                user_activityevents[0].payload.login_location.longitude,
            },
            logout_date: current_date.substring(
              0,
              current_date.lastIndexOf('.'),
            ),
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_child.updatedAt =
            current_date.substring(0, current_date.lastIndexOf('.'));
          data_CreateActivityeventsDto_child.sequenceNumber = '0';
          data_CreateActivityeventsDto_child.flowIsDone = true;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (err_create_activity_events_child) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Create Activity Event Child. Error:' +
                err_create_activity_events_child,
              ],
            },
          });
        }

        //Update ActivityEvent Parent
        try {
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push(
            'DBRef("activityevents", "' +
            ID_child_ActivityEvent +
            '","hyppe_trans_db")',
          );
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id.toString(),
            },
            {
              transitions: data_transitions,
            },
          );
        } catch (err_update_activity_events_parent) {
          throw new NotAcceptableException({
            response_code: 406,
            messages: {
              info: [
                'Unabled to proceed Update Activity Event Parent. Error:' +
                err_update_activity_events_parent,
              ],
            },
          });
        }
        return {
          response_code: 406,
          messages: {
            info: ['Device activity logging successful'],
          },
        };
      } else {
        throw new NotAcceptableException({
          response_code: 406,
          messages: {
            info: ['Unabled to proceed'],
          },
        });
      }
    } else {
      throw new NotAcceptableException({
        response_code: 406,
        messages: {
          info: ['User not found'],
        },
      });
    }
  }

  async recoverpassword(req: any): Promise<any> {
    const decodedJwtAccessToken: any = this.jwtService.decode(
      'eyJhbGciOiJIUzM4NCJ9.eyJkZXZpY2VJZCI6IjU0Njc0NTc0NTc1NDciLCJlbWFpbCI6ImZyZWVtYW4yN0BnZXRuYWRhLmNvbSIsImlhdCI6MTY1NTI3NzQ1NiwiZXhwIjoxNjU3ODY5NDU2fQ.ZlZ4AJ1ZZbz2UEq-52imOw0Fz1zf7BfuVlpa2nDEJrpCOynBP5oqn-w2OLgDqiVe',
    );
    console.log(decodedJwtAccessToken);
    var user_email = req.body.email;
    var user_location = req.body.location;
    var user_deviceId = req.body.deviceId;
    var current_date = new Date().toISOString().replace('T', ' ');
  }

  async changepassword(req: any): Promise<any> { }
}
