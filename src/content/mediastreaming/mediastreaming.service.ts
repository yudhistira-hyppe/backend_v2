import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Mediastreaming, MediastreamingDocument } from './schema/mediastreaming.schema';
import { MediastreamingDto } from './dto/mediastreaming.dto';
import { UtilsService } from 'src/utils/utils.service';
@Injectable()
export class MediastreamingService {
  private readonly logger = new Logger(MediastreamingService.name);
  
  constructor(
    @InjectModel(Mediastreaming.name, 'SERVER_FULL')
    private readonly MediastreamingModel: Model<MediastreamingDocument>,
    private readonly utilsService: UtilsService,
    private readonly configService: ConfigService,
  ) {}

  async createStreaming(MediastreamingDto_: MediastreamingDto): Promise<Mediastreaming> {
    const DataSave = await this.MediastreamingModel.create(MediastreamingDto_);
    return DataSave;
  }

  async findOneStreaming(_id: string): Promise<Mediastreaming> {
    const data = await this.MediastreamingModel.findOne({ _id: new mongoose.Types.ObjectId(_id) });
    return data;
  }

  async updateStreaming(_id: string, MediastreamingDto_: MediastreamingDto) {
    const data = await this.MediastreamingModel.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(_id) },
      MediastreamingDto_,
      { new: true });
    return data;
  }

  async findView(_id: string, userID: string){
    const data = await this.MediastreamingModel.find({
      _id: new mongoose.Types.ObjectId(_id),
      view: {
        $elemMatch: { userId: new mongoose.Types.ObjectId(userID), status: true }
      }
    });
    return data;
  }

  async getDataComment(_id: string) {
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id),

        }
      },
      {
        $unwind:
        {
          path: "$comment",
          includeArrayIndex: "updateAt_index",

        }
      },
      {
        "$lookup": {
          from: "userbasics",
          as: "data_userbasics",
          let: {
            localID: "$comment.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                userAuth: "$userAuth.$id",
                profilePict: "$profilePict.$id",

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "data_userauths",
                let: {
                  localID: '$userAuth'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$_id', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      email: 1,
                      username: 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "data_mediaprofilepicts",
                let: {
                  localID: '$profilePict'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$_id', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                userAuth: {
                  "$let": {
                    "vars": {
                      "tmp": {
                        "$arrayElemAt": ["$data_userauths", 0]
                      }
                    },
                    "in": "$$tmp._id"
                  }
                },
                username: {
                  "$let": {
                    "vars": {
                      "tmp": {
                        "$arrayElemAt": ["$data_userauths", 0]
                      }
                    },
                    "in": "$$tmp.username"
                  }
                },
                avatar: {
                  "mediaBasePath": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaBasePath"
                    }
                  },
                  "mediaUri": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaUri"
                    }
                  },
                  "mediaType": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaType"
                    }
                  },
                  "mediaEndpoint": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaEndpoint"
                    }
                  }
                }
              }
            },

          ],
        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "userAuth": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.userAuth"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
          "messages": "$comment.messages",
          "idStream": "$_id",
        }
      },
    ];
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async getDataView(_id: string, page: number, limit: number){
    let page_ = (page * limit);
    let limit_ = limit;
    let paramaggregate = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(_id)
        }
      },
      {
        "$project": {
          "view": {
            "$filter": {
              "input": "$view",
              "as": "view",
              "cond": {
                "$and": [
                  {
                    "$eq": ["$$view.status", true]
                  }
                ]
              }
            }
          }
        }
      },
      {
        $unwind:
        {
          path: "$view",
          includeArrayIndex: "updateAt_index",

        }
      },
      { "$limit": limit_ },
      { "$skip": page_ },
      {
        "$lookup": {
          from: "userbasics",
          as: "data_userbasics",
          let: {
            localID: "$view.userId"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$localID"]
                },

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                userAuth: "$userAuth.$id",
                profilePict: "$profilePict.$id",

              }
            },
            {
              "$lookup": {
                from: "userauths",
                as: "data_userauths",
                let: {
                  localID: '$userAuth'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$_id', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      email: 1,
                      username: 1
                    }
                  }
                ],

              }
            },
            {
              "$lookup": {
                from: "mediaprofilepicts",
                as: "data_mediaprofilepicts",
                let: {
                  localID: '$profilePict'
                },
                pipeline: [
                  {
                    $match:
                    {
                      $expr: {
                        $eq: ['$_id', '$$localID']
                      }
                    }
                  },
                  {
                    $project: {
                      "mediaBasePath": 1,
                      "mediaUri": 1,
                      "originalName": 1,
                      "fsSourceUri": 1,
                      "fsSourceName": 1,
                      "fsTargetUri": 1,
                      "mediaType": 1,
                      "mediaEndpoint": {
                        "$concat": ["/profilepict/", "$mediaID"]
                      }
                    }
                  }
                ],

              }
            },
            {
              $project: {
                fullName: 1,
                email: 1,
                userAuth: {
                  "$let": {
                    "vars": {
                      "tmp": {
                        "$arrayElemAt": ["$data_userauths", 0]
                      }
                    },
                    "in": "$$tmp._id"
                  }
                },
                username: {
                  "$let": {
                    "vars": {
                      "tmp": {
                        "$arrayElemAt": ["$data_userauths", 0]
                      }
                    },
                    "in": "$$tmp.username"
                  }
                },
                avatar: {
                  "mediaBasePath": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaBasePath"
                    }
                  },
                  "mediaUri": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaUri"
                    }
                  },
                  "mediaType": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaType"
                    }
                  },
                  "mediaEndpoint": {
                    "$let": {
                      "vars": {
                        "tmp": {
                          "$arrayElemAt": ["$data_mediaprofilepicts", 0]
                        }
                      },
                      "in": "$$tmp.mediaEndpoint"
                    }
                  }
                }
              }
            },

          ],

        }
      },
      {
        "$project": {
          "_id": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp._id"
            }
          },
          "email": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.email"
            }
          },
          "fullName": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.fullName"
            }
          },
          "userAuth": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.userAuth"
            }
          },
          "username": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.username"
            }
          },
          "avatar": {
            "$let": {
              "vars": {
                "tmp": {
                  "$arrayElemAt": ["$data_userbasics", 0]
                }
              },
              "in": "$$tmp.avatar"
            }
          },
        }
      },
    ];
    console.log(JSON.stringify(paramaggregate));
    const data = await this.MediastreamingModel.aggregate(paramaggregate);
    return data;
  }

  async updateView(_id: string, userId: string, statusSearch: boolean, statusUpdate: boolean, updateAt: string) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id),
      "view.userId": new mongoose.Types.ObjectId(userId),
      "view.status": statusSearch
    }, 
    {
      $set: { "view.$.status": statusUpdate, "view.$.updateAt": updateAt }
    });
    console.log(data)
    return data;
  }

  async insertView(_id: string, view: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    }, 
    {
      $push: {
        "view": view
      }
    });
    return data;
  }

  async insertComment(_id: string, comment: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "comment": comment
        }
      });
    return data;
  }

  async insertLike(_id: string, like: any) {
    const data = await this.MediastreamingModel.updateOne({
      _id: new mongoose.Types.ObjectId(_id)
    },
      {
        $push: {
          "like": { $each: like }
        }
      });
    return data;
  }

  async generateUrl(streamId: string, expireTime: number): Promise<any>{
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    //Get KEY_STREAM_LIVE
    const GET_KEY_STREAM_LIVE = this.configService.get("KEY_STREAM_LIVE");
    const KEY_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_STREAM_LIVE);

    //Get URL_INGEST_LIVE
    const GET_URL_INGEST_LIVE = this.configService.get("URL_INGEST_LIVE");
    const URL_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_INGEST_LIVE);

    //Get KEY_INGEST_LIVE
    const GET_KEY_INGEST_LIVE = this.configService.get("KEY_INGEST_LIVE");
    const KEY_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_INGEST_LIVE);

    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    const urlStream = await this.generateStream(URL_STREAM_LIVE.toString(), KEY_STREAM_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    const urlIngest = await this.generateIngest(URL_INGEST_LIVE.toString(), KEY_INGEST_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    return {
      urlStream: urlStream,
      urlIngest: urlIngest
    }
    
  }

  async generateStream(pullDomain: String, pullKey: String, appName: String, streamName: String, expireTime: number): Promise<String>{
    let rtmpUrl: String = "";
    if (pullKey == "") {
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName;
    } else {
      let rtmpToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pullKey;
      let rtmpAuthKey: String = await this.md5(rtmpToMd5);
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
    }
    return rtmpUrl;
  }

  async generateIngest(pushDomain: String, pushKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let pushUrl: String = "";
    if (pushKey == "") {
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName;
    } else {
      let stringToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pushKey;
      let authKey: String = await this.md5(stringToMd5);
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + authKey;
    }
    return pushUrl;
  }

  async generateStreamTest(pullDomain: String, pullKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let rtmpUrl: String = "";
    if (pullKey == "") {
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName;
    } else {
      let rtmpToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pullKey;
      let rtmpAuthKey: String = await this.md5(rtmpToMd5);
      rtmpUrl = "rtmp://" + pullDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + rtmpAuthKey;
    }
    return rtmpUrl;
  }

  async generateIngestTest(pushDomain: String, pushKey: String, appName: String, streamName: String, expireTime: number): Promise<String> {
    let pushUrl: String = "";
    if (pushKey == "") {
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName;
    } else {
      let stringToMd5: String = "/" + appName + "/" + streamName + "-" + expireTime.toString() + "-0-0-" + pushKey;
      let authKey: String = await this.md5(stringToMd5);
      pushUrl = "rtmp://" + pushDomain + "/" + appName + "/" + streamName + "?auth_key=" + expireTime.toString() + "-0-0-" + authKey;
    }
    console.log(pushUrl)
    return pushUrl;
  }

  async generateUrlTest(streamId: string, expireTime: number): Promise<any> {
    //Get URL_STREAM_LIVE
    const GET_URL_STREAM_LIVE = this.configService.get("URL_STREAM_LIVE");
    const URL_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_STREAM_LIVE);

    //Get KEY_STREAM_LIVE
    const GET_KEY_STREAM_LIVE = this.configService.get("KEY_STREAM_LIVE");
    const KEY_STREAM_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_STREAM_LIVE);

    //Get URL_INGEST_LIVE
    const GET_URL_INGEST_LIVE = this.configService.get("URL_INGEST_LIVE");
    const URL_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_URL_INGEST_LIVE);

    //Get KEY_INGEST_LIVE
    const GET_KEY_INGEST_LIVE = this.configService.get("KEY_INGEST_LIVE");
    const KEY_INGEST_LIVE = await this.utilsService.getSetting_Mixed(GET_KEY_INGEST_LIVE);

    //Get APP_NAME_LIVE
    const GET_APP_NAME_LIVE = this.configService.get("APP_NAME_LIVE");
    const APP_NAME_LIVE = await this.utilsService.getSetting_Mixed(GET_APP_NAME_LIVE);

    const urlStream = await this.generateStreamTest(URL_STREAM_LIVE.toString(), KEY_STREAM_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    const urlIngest = await this.generateIngestTest(URL_INGEST_LIVE.toString(), KEY_INGEST_LIVE.toString(), APP_NAME_LIVE.toString(), streamId, expireTime);
    console.log({
      urlStream: urlStream,
      urlIngest: urlIngest
    })
    return {
      urlStream: urlStream,
      urlIngest: urlIngest
    }
  }

  async md5(param: String){
    if (param == null || param.length === 0) {
      return null;
    }
    try {
      const md5 = require('crypto').createHash('md5');
      md5.update(param);
      const result = md5.digest('hex');
      return result;
    } catch (error) {
      console.error(error);
    }
    return null;
  }
}
