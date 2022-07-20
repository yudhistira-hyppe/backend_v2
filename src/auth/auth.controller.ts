import {
  Controller,
  Request,
  Post,
  Get,
  UseGuards,
  Body,
  Param,
  Put,
  Query,
  Req,
  HttpCode,
  HttpStatus,
  Res,
  Headers,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { UtilsService } from '../utils/utils.service';
import { JwtRefreshAuthGuard } from './refresh-auth.guard';
import { DeviceActivityRequest, LoginRequest, LogoutRequest, RefreshTokenRequest } from '../utils/data/request/globalRequest';
import { CreateActivityeventsDto } from '../trans/activityevents/dto/create-activityevents.dto';
import { CreateUserdeviceDto } from '../trans/userdevices/dto/create-userdevice.dto';
import { ActivityeventsService } from '../trans/activityevents/activityevents.service';
import { JwtrefreshtokenService } from '../trans/jwtrefreshtoken/jwtrefreshtoken.service';
import { UserauthsService } from '../trans/userauths/userauths.service';
import { UserbasicsService } from '../trans/userbasics/userbasics.service';
import { UserdevicesService } from '../trans/userdevices/userdevices.service';
import { ErrorHandler } from '../utils/error.handler';
import mongoose from 'mongoose';
import { Int32 } from 'mongodb';
import { ProfileDTO } from '../utils/data/Profile';
import { GlobalResponse } from '../utils/data/globalResponse';
import { GlobalMessages } from '../utils/data/globalMessage';
import { FileInterceptor } from '@nestjs/platform-express/multer';

@Controller()
export class AuthController {
  constructor(
    private errorHandler: ErrorHandler,
    private authService: AuthService,
    private utilsService: UtilsService,
    private activityeventsService: ActivityeventsService,
    private userbasicsService: UserbasicsService,
    private userdevicesService: UserdevicesService,
    private jwtrefreshtokenService: JwtrefreshtokenService,
    private userauthsService: UserauthsService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('api/user/login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Body() LoginRequest_: LoginRequest) {
    var current_date = await this.utilsService.getDateTimeString();

    var _class_ActivityEvent = 'io.melody.hyppe.trans.domain.ActivityEvent';
    var _class_UserDevices = 'io.melody.core.domain.UserDevices';

    var _isEmailVerified = false;

    //Ceck User ActivityEvent Parent
    const data_activityevents = await this.activityeventsService.findParent(
      LoginRequest_.email,
      LoginRequest_.deviceId,
      'LOGIN',
      false,
    );

    //Ceck User Userdevices
    const data_userdevices = await this.userdevicesService.findOneEmail(LoginRequest_.email, LoginRequest_.deviceId);

    //Ceck User Userauths
    const data_userauths = await this.userauthsService.findOneByEmail(
      LoginRequest_.email,
    );

    //Ceck User Userbasics
    const data_userbasics = await this.userbasicsService.findOne(
      LoginRequest_.email,
    );

    //Ceck User jwtrefresh token
    const data_jwtrefreshtoken = await this.jwtrefreshtokenService.findOne(
      LoginRequest_.email,
    );

    if ((await this.utilsService.ceckData(data_userbasics)) && (await this.utilsService.ceckData(data_jwtrefreshtoken))) {
      if (await this.utilsService.ceckData(data_userauths)) {
        _isEmailVerified = data_userauths.isEmailVerified;
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Data user auths not found',
        );
      }

      if (_isEmailVerified) {
        let messages_response;
        if (Object.keys(data_activityevents).length > 0) {
          var Activityevents_child = new CreateActivityeventsDto();
          var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

          var latitude = undefined;
          var longitude = undefined;
          if (LoginRequest_.location != undefined) {
            if (LoginRequest_.location.latitude != undefined) {
              latitude = LoginRequest_.location.latitude;
            }
            if (LoginRequest_.location.longitude != undefined) {
              longitude = LoginRequest_.location.longitude;
            }
          }
          //Create ActivityEvent child
          try {
            Activityevents_child._id = generate_id_Activityevents_child;
            Activityevents_child.activityEventID =
              generate_activityEventID_Activityevents_child;
            Activityevents_child.activityType = 'DEVICE_ACTIVITY';
            Activityevents_child.active = true;
            Activityevents_child.status = 'INITIAL';
            Activityevents_child.target = 'ACTIVE';
            Activityevents_child.event = 'AWAKE';
            Activityevents_child._class = _class_ActivityEvent;
            Activityevents_child.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_child.createdAt = current_date;
            Activityevents_child.updatedAt = current_date;
            Activityevents_child.sequenceNumber = new Int32(1);
            Activityevents_child.flowIsDone = false;
            Activityevents_child.__v = undefined;
            Activityevents_child.parentActivityEventID =
              data_activityevents[0].activityEventID;
            Activityevents_child.userbasic =
              data_userbasics._id;

            //Insert ActivityEvent child
            await this.activityeventsService.create(Activityevents_child);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create Activity events Child. Error:' + error,
            );
          }

          //Update ActivityEvent Parent
          try {
            const data_transitions = data_activityevents[0].transitions;
            data_transitions.push({
              $ref: 'activityevents',
              $id: new Object(generate_activityEventID_Activityevents_child),
              $db: 'hyppe_trans_db',
            });

            //Update ActivityEvent Parent
            const update_activityevents_parent =
              await this.activityeventsService.update(
                {
                  _id: data_activityevents[0]._id,
                },
                {
                  transitions: data_transitions,
                },
              );
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed Update Activity events Parent. Error:' +
              error,
            );
          }
          messages_response = 'Device activity logging successful';
        } else {
          var Activityevents_parent = new CreateActivityeventsDto();
          var generate_id_Activityevents_parent = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_parent = (await this.utilsService.generateId()).toLowerCase();

          var Activityevents_child = new CreateActivityeventsDto();
          var generate_id_Activityevents_child = new mongoose.Types.ObjectId();
          var generate_activityEventID_Activityevents_child = (await this.utilsService.generateId()).toLowerCase();

          var latitude = undefined;
          var longitude = undefined;
          if (LoginRequest_.location != undefined) {
            if (LoginRequest_.location.latitude != undefined) {
              latitude = LoginRequest_.location.latitude;
            }
            if (LoginRequest_.location.longitude != undefined) {
              longitude = LoginRequest_.location.longitude;
            }
          }

          //Create ActivityEvent Parent
          try {
            Activityevents_parent._id = generate_id_Activityevents_parent;
            Activityevents_parent.activityEventID = generate_activityEventID_Activityevents_parent;
            Activityevents_parent.activityType = 'LOGIN';
            Activityevents_parent.active = true;
            Activityevents_parent.status = 'INITIAL';
            Activityevents_parent.target = 'USER_LOGOUT';
            Activityevents_parent.event = 'LOGIN';
            Activityevents_parent._class = _class_ActivityEvent;
            Activityevents_parent.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_parent.createdAt = current_date;
            Activityevents_parent.updatedAt = current_date;
            Activityevents_parent.sequenceNumber = new Int32(0);
            Activityevents_parent.flowIsDone = false;
            Activityevents_parent.__v = undefined;
            Activityevents_parent.transitions = [
              {
                $ref: 'activityevents',
                $id: Object(generate_activityEventID_Activityevents_child),
                $db: 'hyppe_trans_db',
              },
            ];
            Activityevents_parent.userbasic = data_userbasics._id;

            //Insert ActivityEvent Parent
            await this.activityeventsService.create(Activityevents_parent);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create activity events parent. Error:' +
              error,
            );
          }

          //Create ActivityEvent child
          try {
            Activityevents_child._id = generate_id_Activityevents_child;
            Activityevents_child.activityEventID = generate_activityEventID_Activityevents_child;
            Activityevents_child.activityType = 'DEVICE_ACTIVITY';
            Activityevents_child.active = true;
            Activityevents_child.status = 'INITIAL';
            Activityevents_child.target = 'ACTIVE';
            Activityevents_child.event = 'AWAKE';
            Activityevents_child._class = _class_ActivityEvent;
            Activityevents_child.payload = {
              login_location: {
                latitude: latitude,
                longitude: longitude,
              },
              logout_date: undefined,
              login_date: current_date,
              login_device: LoginRequest_.deviceId,
              email: LoginRequest_.email,
            };
            Activityevents_child.createdAt = current_date;
            Activityevents_child.updatedAt = current_date;
            Activityevents_child.sequenceNumber = new Int32(1);
            Activityevents_child.flowIsDone = false;
            Activityevents_child.__v = undefined;
            Activityevents_child.parentActivityEventID = generate_activityEventID_Activityevents_parent;
            Activityevents_child.userbasic = data_userbasics._id;

            //Insert ActivityEvent Parent
            await this.activityeventsService.create(Activityevents_child);
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed create Activity events Child. Error:' + error,
            );
          }

          var Id_user_userdevices = null;
          //Userdevices != null
          if (await this.utilsService.ceckData(data_userdevices)) {
            //Get Userdevices
            try {
              var data_update = null;
              if (LoginRequest_.devicetype != undefined) {
                data_update = {
                  active: true,
                  devicetype: LoginRequest_.devicetype
                };
              } else {
                data_update = {
                  active: true
                };
              }
              await this.userdevicesService.updatebyEmail(LoginRequest_.email, LoginRequest_.deviceId, data_update);
              Id_user_userdevices = data_userdevices._id;
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Failed update user devices. Error:' + error,
              );
            }
          } else {
            var CreateUserdeviceDto_ = new CreateUserdeviceDto();
            //Create Userdevices
            try {
              Id_user_userdevices = (await this.utilsService.generateId()).toLowerCase();
              CreateUserdeviceDto_._id = Id_user_userdevices;
              CreateUserdeviceDto_.deviceID = LoginRequest_.deviceId;
              CreateUserdeviceDto_.email = LoginRequest_.email;
              CreateUserdeviceDto_.active = true;
              CreateUserdeviceDto_._class = _class_UserDevices;
              CreateUserdeviceDto_.createdAt = current_date;
              CreateUserdeviceDto_.updatedAt = current_date;
              if (LoginRequest_.devicetype != undefined) {
                CreateUserdeviceDto_.devicetype = LoginRequest_.devicetype;
              }
              //Insert User Userdevices
              await this.userdevicesService.create(CreateUserdeviceDto_);
            } catch (error) {
              await this.errorHandler.generateNotAcceptableException(
                'Unabled to proceed, Failed update user devices. Error:' + error,
              );
            }
          }

          //Update Devices Userauths
          try {
            //Get Devices Userauths
            const data_userauths_devices_list = data_userauths.devices;

            //Filter ID_user_userdevicesService Devices UserDevices
            var filteredData = data_userauths_devices_list.filter(function (data_userauths_devices_list) {
              return (JSON.parse(JSON.stringify(data_userauths_devices_list)).$id === Id_user_userdevices);
            });

            if (filteredData.length == 0) {
              //Pust Devices Userauths
              data_userauths_devices_list.push({
                $ref: 'userdevices',
                $id: Object(Id_user_userdevices),
                $db: 'hyppe_trans_db',
              });

              await this.userauthsService.updatebyEmail(LoginRequest_.email, {
                devices: data_userauths_devices_list,
              });
            }
          } catch (error) {
            await this.errorHandler.generateNotAcceptableException(
              'Unabled to proceed, Failed update devices userauths. Error:' + error,
            );
          }
          messages_response = 'Login successful';
        }

        var ProfileDTO_ = new ProfileDTO();
        ProfileDTO_ = await this.utilsService.generateProfile(LoginRequest_.email, 'LOGIN');
        ProfileDTO_.token = 'Bearer ' + (await this.utilsService.generateToken(LoginRequest_.email, LoginRequest_.deviceId)).toString();
        ProfileDTO_.refreshToken = data_jwtrefreshtoken.refresh_token_id;

        var GlobalResponse_ = new GlobalResponse();
        var GlobalMessages_ = new GlobalMessages();
        GlobalMessages_.info = [messages_response];

        GlobalResponse_.response_code = 202;
        GlobalResponse_.data = ProfileDTO_;
        GlobalResponse_.messages = GlobalMessages_;
        GlobalResponse_.version = await this.utilsService.getversion();
        return GlobalResponse_;
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, Data email not verified ',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, Data user basics and jwt not found',
      );
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('api/user/refreshtoken')
  @HttpCode(HttpStatus.ACCEPTED)
  async refreshToken(@Body() RefreshTokenRequest_: RefreshTokenRequest) {
    //Ceck User Jwtrefreshtoken
    const data_jwtrefreshtokenService =
      await this.jwtrefreshtokenService.findByEmailRefreshToken(RefreshTokenRequest_.email, RefreshTokenRequest_.refreshToken);

    //Ceck User Userbasics
    const data_userbasicsService = await this.userbasicsService.findOne(RefreshTokenRequest_.email);

    if (await this.utilsService.ceckData(data_jwtrefreshtokenService)) {
      var date_exp = await data_jwtrefreshtokenService.exp;
      //Ceck Time Refresh Token Expired
      if (new Date().getTime() < Number(await date_exp)) {
        await this.errorHandler.generateNotAcceptableException(
          'Refesh token still valid',
        );
      } else {
        //Ceck User Userauths
        const datauserauthsService = await this.userauthsService.findOneByEmail(RefreshTokenRequest_.email);

        //Get Id Userdevices
        const datauserauthsService_devices = datauserauthsService.devices[datauserauthsService.devices.length - 1];

        //Generate Token
        var Token = 'Bearer ' + (await this.utilsService.generateToken(data_userbasicsService.email.toString(), data_userbasicsService._id.toString()));

        //Generate Refresh Token
        var RefreshToken = await this.authService.updateRefreshToken(data_userbasicsService.email.toString());

        var GlobalResponse_ = new GlobalResponse();
        var GlobalMessages_ = new GlobalMessages();
        var ProfileDTO_ = new ProfileDTO();

        ProfileDTO_.token = Token;
        ProfileDTO_.refreshToken = RefreshToken;

        GlobalMessages_.info = ['Refresh Token successful'];

        GlobalResponse_.response_code = 202;
        GlobalResponse_.data = ProfileDTO_;
        GlobalResponse_.messages = GlobalMessages_;
        return GlobalResponse_;
      }
    } else {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/logout')
  @HttpCode(HttpStatus.ACCEPTED)
  async logout(@Body() LogoutRequest_: LogoutRequest, @Headers() headers) {
    if (!(await this.utilsService.validasiTokenEmail(headers))) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email is required',
      );
    }
    var user_email_header = headers['x-auth-user'];
    var user_email = LogoutRequest_.email;
    var user_deviceId = LogoutRequest_.deviceId;
    var current_date = await this.utilsService.getDateTimeString();
    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed, email not match',
      );
    }

    //Ceck User Userbasics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    //Ceck Activity Events
    const user_activityevents = await this.activityeventsService.findParent(
      user_email,
      user_deviceId,
      'LOGIN',
      false,
    );

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    //Ceck User Devices
    const user_userdevicesService = await this.userdevicesService.findOneEmail(
      user_email,
      user_deviceId,
    );

    if (await this.utilsService.ceckData(user_userbasics)) {
      if (Object.keys(user_activityevents).length > 0) {
        //Create ActivityEvent Child
        try {
          var latitude_ = undefined;
          var longitude_ = undefined;
          if (user_activityevents[0].payload.login_location != undefined) {
            if (user_activityevents[0].payload.login_location.latitude != undefined) {
              latitude_ = user_activityevents[0].payload.login_location.latitude;
            }
            if (user_activityevents[0].payload.login_location.longitude != undefined) {
              longitude_ = user_activityevents[0].payload.login_location.longitude;
            }
          }
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'LOGIN';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = 'USER_LOGOUT';
          data_CreateActivityeventsDto_child.target = 'COMPLETE';
          data_CreateActivityeventsDto_child.event = 'LOGOUT';
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: latitude_,
              longitude: longitude_,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(2);
          data_CreateActivityeventsDto_child.flowIsDone = true;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
          );
        }

        //Update ActivityEvent Parent
        try {
          var latitude_ = undefined;
          var longitude_ = undefined;
          if (user_activityevents[0].payload.login_location != undefined) {
            if (user_activityevents[0].payload.login_location.latitude != undefined) {
              latitude_ = user_activityevents[0].payload.login_location.latitude;
            }
            if (user_activityevents[0].payload.login_location.longitude != undefined) {
              longitude_ = user_activityevents[0].payload.login_location.longitude;
            }
          }
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push({
            $ref: 'activityevents',
            $id: new Object(ID_child_ActivityEvent),
            $db: 'hyppe_trans_db',
          });
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              payload: {
                login_location: {
                  latitude: latitude_,
                  longitude: longitude_,
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
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' + error,
          );
        }

        //Update ActivityEvent All Child True
        try {
          await this.activityeventsService.updateFlowDone(
            user_activityevents[0].activityEventID,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update ActivityEvent All Child True. Error:' +
            error,
          );
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
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Userdevices. Error:' + error,
          );
        }
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed, device id not login',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('Unabled to proceed, User not found');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('api/user/deviceactivity')
  @HttpCode(HttpStatus.ACCEPTED)
  async deviceactivity(@Body() DeviceActivityRequest_: DeviceActivityRequest, @Headers() headers) {
    var user_email_header = headers['x-auth-user'];
    var user_email = DeviceActivityRequest_.email;
    var user_deviceId = DeviceActivityRequest_.deviceId;
    var user_event = DeviceActivityRequest_.event;
    var user_status = DeviceActivityRequest_.status;
    var current_date = await this.utilsService.getDateTimeString();

    var data_CreateActivityeventsDto_child = new CreateActivityeventsDto();

    var ID_child_ActivityEvent = (
      await this.utilsService.generateId()
    ).toLowerCase();

    var id_Activityevents_child = new mongoose.Types.ObjectId();

    if (user_email_header != user_email) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }
    if (
      !(
        (user_event == 'AWAKE' && user_status == 'INITIAL') ||
        (user_event == 'SLEEP' && user_status == 'ACTIVE')
      )
    ) {
      await this.errorHandler.generateNotAcceptableException(
        'Unabled to proceed',
      );
    }

    var target_ = null;
    if (user_event == 'AWAKE') {
      target_ = 'ACTIVE';
    } else if (user_event == 'SLEEP') {
      target_ = 'INACTIVE';
    }

    //Ceck User basics
    const user_userbasics = await this.userbasicsService.findOne(user_email);

    if (await this.utilsService.ceckData(user_userbasics)) {
      //Ceck User ActivityEvent Parent
      const user_activityevents = await this.activityeventsService.findParent(
        user_email,
        user_deviceId,
        'LOGIN',
        false,
      );

      if (Object.keys(user_activityevents).length > 0) {
        var latitude_ = undefined;
        var longitude_ = undefined;
        if (user_activityevents[0].payload.login_location != undefined) {
          if (user_activityevents[0].payload.login_location.latitude != undefined) {
            latitude_ = user_activityevents[0].payload.login_location.latitude;
          }
          if (user_activityevents[0].payload.login_location.longitude != undefined) {
            longitude_ = user_activityevents[0].payload.login_location.longitude;
          }
        }
        //Create ActivityEvent Child
        try {
          data_CreateActivityeventsDto_child._id = id_Activityevents_child;
          data_CreateActivityeventsDto_child.activityEventID =
            ID_child_ActivityEvent;
          data_CreateActivityeventsDto_child.activityType = 'DEVICE_ACTIVITY';
          data_CreateActivityeventsDto_child.active = true;
          data_CreateActivityeventsDto_child.status = user_status;
          data_CreateActivityeventsDto_child.target = target_;
          data_CreateActivityeventsDto_child.event = user_event;
          data_CreateActivityeventsDto_child._class =
            'io.melody.hyppe.trans.domain.ActivityEvent';
          data_CreateActivityeventsDto_child.payload = {
            login_location: {
              latitude: latitude_,
              longitude: longitude_,
            },
            logout_date: current_date,
            login_date: user_activityevents[0].payload.login_date,
            login_device: user_deviceId,
            email: user_email,
          };
          data_CreateActivityeventsDto_child.createdAt = current_date;
          data_CreateActivityeventsDto_child.updatedAt = current_date;
          data_CreateActivityeventsDto_child.sequenceNumber = new Int32(1);
          data_CreateActivityeventsDto_child.flowIsDone = false;
          data_CreateActivityeventsDto_child.__v = undefined;
          data_CreateActivityeventsDto_child.parentActivityEventID =
            user_activityevents[0].activityEventID;
          data_CreateActivityeventsDto_child.userbasic = user_userbasics._id;

          //Insert ActivityEvent Child
          await this.activityeventsService.create(
            data_CreateActivityeventsDto_child,
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Create Activity Event Child. Error:' + error,
          );
        }

        //Update ActivityEvent Parent
        try {
          const data_transitions = user_activityevents[0].transitions;
          data_transitions.push({
            $ref: 'activityevents',
            $id: new Object(ID_child_ActivityEvent),
            $db: 'hyppe_trans_db',
          });
          await this.activityeventsService.update(
            {
              _id: user_activityevents[0]._id,
            },
            {
              flowIsDone: false,
              transitions: data_transitions,
            },
          );
        } catch (error) {
          await this.errorHandler.generateNotAcceptableException(
            'Unabled to proceed Update Activity Event Parent. Error:' +
            error,
          );
        }

        return {
          response_code: 202,
          messages: {
            info: ['Device activity logging successful'],
          },
        };
      } else {
        await this.errorHandler.generateNotAcceptableException(
          'Unabled to proceed ',
        );
      }
    } else {
      await this.errorHandler.generateNotAcceptableException('User not found');
    }
  }

  @Post('api/user/recoverpassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async recoverpassword(@Req() request: any) {
    return await this.authService.recoverpassword(request);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Get('api/user/profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('api/user/changepassword')
  @HttpCode(HttpStatus.ACCEPTED)
  async changepassword(@Req() request: any, @Headers() headers) {
    return await this.authService.changepassword(request, headers);
  }

  @Post('api/user/signup')
  @HttpCode(HttpStatus.ACCEPTED)
  async signup(@Req() request: any) {
    return await this.authService.signup(request);
  }

  @Post('api/user/verifyaccount')
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyaccount(@Req() request: any) {
    return await this.authService.signup(request);
  }

  @Post('api/user/updateprofile')
  @HttpCode(HttpStatus.ACCEPTED)
  async updateprofile(@Req() request: any, @Headers() headers) {
    return await this.authService.updateprofile(request, headers);
  }

  @Post('api/user/resendotp')
  @HttpCode(HttpStatus.ACCEPTED)
  async resendotp(@Req() request: any) {
    return await this.authService.resendotp(request);
  }

  @Post('api/user/updatelang')
  @HttpCode(HttpStatus.ACCEPTED)
  async updatelang(@Req() request: any, @Headers() headers) {
    return await this.authService.updatelang(request, headers);
  }

  @Post('api/user/referral-count')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_count(@Req() request: any, @Headers() headers) {
    return await this.authService.referralcount(request, headers);
  }

  @Post('api/user/referral')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral(@Req() request: any, @Headers() headers) {
    return await this.authService.referral(request, headers);
  }

  @Post('api/user/referral-qrcode')
  @HttpCode(HttpStatus.ACCEPTED)
  async referral_qrcode(@Req() request: any, @Headers() headers, @Res() response) {
    var data = await this.authService.referralqrcode(request, headers);
    response.set("Content-Type", "image/jpeg");
    response.send(data);
  }

  @Get('profilePict/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async profilePict(
    @Param('id') id: string,
    @Query('x-auth-token') token: string,
    @Query('x-auth-user') email: string, @Res() response) {
    var data = await this.authService.profilePict(id, token, email);
    response.set("Content-Type", "image/jpeg");
    response.send(data);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @Put('api/userauths/:email')
  async updateRole(
    @Param('email') email: string, @Req() request: any, @Headers() headers) {
    return await this.authService.updateRole(email, headers, request);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/signup/socmed')
  async signupsosmed(@Req() request: any) {
    return await this.authService.signupsosmed(request);
  }


  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/sign/socmed')
  async signsosmed(@Req() request: any) {
    var deviceId = null;
    var socmedSource = null;
    var devicetype = null;
    var email = null;
    var request_json = JSON.parse(JSON.stringify(request.body));
    if (request_json["socmedSource"] !== undefined) {
      socmedSource = request_json["socmedSource"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }

    if (request_json["deviceId"] !== undefined) {
      deviceId = request_json["deviceId"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["devicetype"] !== undefined) {
      devicetype = request_json["devicetype"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    if (request_json["email"] !== undefined) {
      email = request_json["email"];
    } else {
      throw new BadRequestException("Unabled to proceed");
    }
    return await this.authService.signsosmed(request);
  }

  @HttpCode(HttpStatus.ACCEPTED)
  @Post('api/getuserprofile')
  async getuserprofile(@Req() request: any, @Headers() headers,
    @Query('search') pageNumber: number,
    @Query('pageRow') pageRow: number,
    @Query('pageNumber') search: string) {
    return await this.authService.getuserprofile(request, headers);
  }
}