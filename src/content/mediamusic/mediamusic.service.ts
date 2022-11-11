import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediamusicDto } from './dto/mediamusic.dto';
import { Mediamusic, MediamusicDocument } from './schemas/mediamusic.schema';
import mongoose, { Model } from 'mongoose';
import { ApsaraImageResponse, ApsaraPlayResponse, ImageInfo } from '../posts/dto/create-posts.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediamusicService {
  private readonly logger = new Logger(MediamusicService.name);
  constructor(
    @InjectModel(Mediamusic.name, 'SERVER_FULL')
    private readonly MediamusicModel: Model<MediamusicDocument>,
    private readonly configService: ConfigService,
  ) {}

  async createMusic(MediamusicDto_: MediamusicDto): Promise<Mediamusic> {
    const DataSave = await this.MediamusicModel.create(MediamusicDto_);
    return DataSave;
  }

  async findCriteria(pageNumber: number, pageRow: number, search: string, genre: string, theme: string, mood: string): Promise<Mediamusic[]> {
    var perPage = pageRow, page = Math.max(0, pageNumber);
    var where = {};
    if (search != undefined) {
      if (search != ""){
        where['musicTitle'] = { $regex: search, $options: "i" };
      }
    }
    if (genre != undefined) {
      if (genre != "") {
        where['genre'] = new mongoose.Types.ObjectId(genre);
      }
    }
    if (theme != undefined) {
      if (theme != "") {
        where['theme'] = new mongoose.Types.ObjectId(theme);
      }
    }
    if (mood != undefined) {
      if (mood != "") {
        where['mood'] = new mongoose.Types.ObjectId(mood);
      }
    }
    where['isActive'] = true;
    const query = await this.MediamusicModel.find(where).limit(perPage).skip(perPage * page).sort({ musicTitle: 'desc' });
    return query;
  }

  async findCriteriaWitoutSkipLimit(pageNumber: number, pageRow: number, search: string, genre: string, theme: string, mood: string): Promise<Mediamusic[]> {
    var perPage = pageRow, page = Math.max(0, pageNumber);
    var where = {};
    if (search != undefined) {
      if (search != "") {
        where['musicTitle'] = { $regex: search, $options: "i" };
      }
    }
    if (genre != undefined) {
      if (genre != "") {
        where['genre'] = new mongoose.Types.ObjectId(genre);
      }
    }
    if (theme != undefined) {
      if (theme != "") {
        where['theme'] = new mongoose.Types.ObjectId(theme);
      }
    }
    if (mood != undefined) {
      if (theme != "") {
        where['mood'] = new mongoose.Types.ObjectId(theme);
      }
    }
    where['isActive'] = true;
    where['isDelete'] = false;
    const query = await this.MediamusicModel.find(where).limit(perPage).skip(perPage * page).sort({ musicTitle: 'desc' });
    return query;
  }

  async findOneDetail(_id: string) {
    var ObjectId_ = new mongoose.Types.ObjectId(_id);
    const query = await this.MediamusicModel.aggregate([
      { $match: { _id: ObjectId_ } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'musicId',
          as: 'posts_data',
        },
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: { $size: "$posts_data" },
          posts_data: '$posts_data',
        }
      }, 
      {
        $unwind: {
          path: "$posts_data"
        }
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: '$usedMusic',
          postID: '$posts_data.postID',
          views: '$posts_data.views',
        }
      },
      {
        $lookup: {
          from: 'contentevents',
          let: { "postID": "$postID" },
          pipeline: [
            {
              $match: { 
                $expr: { $eq: ["$postID", "$$postID"] },
                'eventType': 'VIEW', 'event': 'ACCEPT' }
            }
          ],
          as: 'contentevents_data'
        }
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: '$usedMusic',
          postID: '$postID',
          views: '$views',
          musicView: { $size: "$contentevents_data" },
          contentevents_data:'$contentevents_data'
        }
      },
      {
        $unwind: {
          path: "$contentevents_data"
        }
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: '$usedMusic',
          postID: '$postID',
          views: '$views',
          musicView: "$musicView",
          eventType: '$contentevents_data.eventType',
          event: '$contentevents_data.event',
          senderParty: '$contentevents_data.senderParty',
          viewAt: '$contentevents_data.viewAt',
        }
      },
      {
        $lookup: {
          from: 'userbasics',
          localField: 'senderParty',
          foreignField: 'email',
          as: 'userbasics_data',
        },
      },
      {
        $unwind: {
          path: "$userbasics_data"
        }
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: '$usedMusic',
          postID: '$postID',
          views: '$views',
          musicView: "$musicView",
          eventType: '$eventType',
          event: '$event',
          senderParty: '$senderParty',
          viewAt: '$viewAt',
          dob: '$userbasics_data.dob',
          gender: '$userbasics_data.gender',
          states: '$userbasics_data.states.$id'
        }
      },
      {
        $lookup: {
          from: 'areas',
          localField: 'states',
          foreignField: '_id',
          as: 'areas_data',
        },
      },
      {
        $unwind: {
          path: "$areas_data"
        }
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: '$usedMusic',
          postID: '$postID',
          views: '$views',
          musicView: "$musicView",
          eventType: '$eventType',
          event: '$event',
          senderParty: '$senderParty',
          viewAt: '$viewAt',
          dob: '$dob',
          discount:{
            $cond: { if: { $dob: ["$qty", 250] }, then: 30, else: 20 }
          },
          gender: '$gender',
          states: '$states',
          stateName: '$areas_data.stateName'
        }
      },
      // {
      //   $facet: {
      //     "musicTitle": [
      //       {
      //         "$group": {
      //           "_id": "$musicTitle",
      //         }
      //       }
      //     ],
      //     "artistName": [
      //       {
      //         "$group": {
      //           "_id": "$artistName",
      //         }
      //       }
      //     ],
      //     "albumName": [
      //       {
      //         "$group": {
      //           "_id": "$albumName",
      //         }
      //       }
      //     ],
      //     "genre": [
      //       {
      //         "$group": {
      //           "_id": "$genre",
      //         }
      //       }
      //     ],
      //     "theme": [
      //       {
      //         "$group": {
      //           "_id": "$theme",
      //         }
      //       }
      //     ],
      //     "mood": [
      //       {
      //         "$group": {
      //           "_id": "$mood",
      //         }
      //       }
      //     ],
      //     "releaseDate": [
      //       {
      //         "$group": {
      //           "_id": "$releaseDate",
      //         }
      //       }
      //     ],
      //     "apsaraMusic": [
      //       {
      //         "$group": {
      //           "_id": "$apsaraMusic",
      //         }
      //       }
      //     ],
      //     "apsaraThumnail": [
      //       {
      //         "$group": {
      //           "_id": "$apsaraThumnail",
      //         }
      //       }
      //     ],
      //     "wilayah": [
      //       {
      //         "$group": {
      //           "_id": "$stateName",
      //           "count": { "$sum": 1 }
      //         }
      //       }
      //     ],
      //     "gender": [
      //       {
      //         "$group": {
      //           "_id": "$gender",
      //           "count": { "$sum": 1 }
      //         }
      //       }
      //     ],
      //     "used": [
      //       {
      //         "$group": {
      //           "_id": "$postID",
      //           "count": { "$sum": 1 }
      //         }
      //       }
      //     ],
      //     "view": [
      //       {
      //         "$group": {
      //           "_id": "$senderParty",
      //           "count": { "$sum": 1 }
      //         }
      //       }
      //     ]
      //   }
      // },
      // {
      //   $project: {
      //     musicTitle: { $arrayElemAt: ['$musicTitle', 0] },
      //     artistName: { $arrayElemAt: ['$artistName', 0] },
      //     albumName: { $arrayElemAt: ['$albumName', 0] },
      //     genre: { $arrayElemAt: ['$genre', 0] },
      //     theme: { $arrayElemAt: ['$theme', 0] },
      //     mood: { $arrayElemAt: ['$mood', 0] },
      //     releaseDate: { $arrayElemAt: ['$releaseDate', 0] },
      //     apsaraMusic: { $arrayElemAt: ['$apsaraMusic', 0] },
      //     apsaraThumnail: { $arrayElemAt: ['$apsaraThumnail', 0] },
      //     view: { $size: '$view' },
      //     used: { $size: '$used' },
      //     gender: '$gender',
      //     wilayah: '$wilayah'
      //   }
      // },
      // {
      //   $project: {
      //     musicTitle: '$musicTitle._id',
      //     artistName: '$artistName._id',
      //     albumName: '$albumName._id',
      //     genre: '$genre._id',
      //     theme: '$theme._id',
      //     mood: '$mood._id',
      //     releaseDate: '$releaseDate._id',
      //     apsaraMusic: '$apsaraMusic._id',
      //     apsaraThumnail: '$apsaraThumnail._id',
      //     view: '$view',
      //     used: '$used',
      //     gender: '$gender',
      //     wilayah: '$wilayah'
      //   }
      // }
    ]);
    return query;
  }

  async updateMusic(_id: string, MediamusicDto_: MediamusicDto) {
    this.MediamusicModel.updateOne(
      { _id: Object(_id) },
      MediamusicDto_,
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      });
  }

  async deleteMusic(_id: string) {
    this.MediamusicModel.updateOne(
      { _id: Object(_id) },
      { isActive: false, isDelete: false },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      });
  }

  async updateUsed(_id: string) {
    this.MediamusicModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(_id),
      },
      { $inc: { used: 1 } },
      function (err, docs) {
        if (err) {
          console.log(err);
        } else {
          console.log(docs);
        }
      },
    );
  }

  async getMusicCard(){
    const query = await this.MediamusicModel.aggregate([
      {
        $lookup: {
          from: 'genre',
          localField: 'genre',
          foreignField: '_id',
          as: 'genre_data',
        },
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: { $arrayElemAt: ['$genre_data', 0] },
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          posts_data: '$posts_data',
        }
      },
      {
        $lookup: {
          from: 'theme',
          localField: 'theme',
          foreignField: '_id',
          as: 'theme_data',
        },
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: { $arrayElemAt: ['$theme_data', 0] },
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          posts_data: '$posts_data',
        }
      },
      {
        $lookup: {
          from: 'mood',
          localField: 'mood',
          foreignField: '_id',
          as: 'mood_data',
        },
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: { $arrayElemAt: ['$mood_data', 0] },
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          posts_data: '$posts_data',
        }
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'musicId',
          as: 'posts_data',
        },
      },
      {
        $project: {
          musicTitle: '$musicTitle',
          artistName: '$artistName',
          albumName: '$albumName',
          genre: '$genre',
          theme: '$theme',
          mood: '$mood',
          releaseDate: '$releaseDate',
          apsaraMusic: '$apsaraMusic',
          apsaraThumnail: '$apsaraThumnail',
          usedMusic: { $size: "$posts_data" },
          posts_data: '$posts_data',
        }
      },
      {
        $unwind: {
          path: "$posts_data"
        }
      },
      {
        $facet:
        {
          "artistPopuler": [
            {
              "$group": {
                "_id": {
                  "artistName": "$artistName",
                  "apsaraMusic": "$apsaraMusic",
                  "apsaraThumnail": "$apsaraThumnail"
                },
                "count": { "$sum": 1 }
              }
            },
            { $sort: { count: -1 } },
            { $skip: 0 },
            { $limit: 5 },
          ],
          "musicPopuler": [
            {
              "$group": {
                "_id": {
                  "musicTitle": "$musicTitle",
                  "apsaraMusic": "$apsaraMusic",
                  "apsaraThumnail": "$apsaraThumnail"
                },
                "count": { "$sum": 1 }
              }
            },
            { $sort: { count: -1 } },
            { $skip: 0 },
            { $limit: 5 },
          ],
          "genrePopuler": [
            {
              "$group": {
                "_id": "$genre",
                "count": { "$sum": 1 }
              }
            },
            { $sort: { count: -1 } },
            { $skip: 0 },
            { $limit: 5 },
          ],
          "themePopuler": [
            {
              "$group": {
                "_id": "$theme",
                "count": { "$sum": 1 }
              }
            },
            { $sort: { count: -1 } },
            { $skip: 0 },
            { $limit: 5 },
          ],
          "moodPopuler": [
            {
              "$group": {
                "_id": "$mood",
                "count": { "$sum": 1 }
              }
            },
            { $sort: { count: -1 } },
            { $skip: 0 },
            { $limit: 5 },
          ],
        }
      }
    ]);
    return query;
  }

  async getMusicFilter(pageNumber: number, pageRow: number, genre: string, theme: string, mood: string, musicTitle: string, artistName: string, createdAtStart: string, createdAtEnd: string, status: string) {
    var perPage = pageRow, page = Math.max(0, pageNumber);
    var where = {};
    if (musicTitle != undefined) {
      if (musicTitle != "") {
        where['musicTitle'] = { $regex: musicTitle, $options: "i" };
      }
    }
    if (artistName != undefined) {
      if (artistName != "") {
        where['artistName'] = { $regex: artistName, $options: "i" };
      }
    }
    if (createdAtStart != undefined && createdAtEnd != undefined) {
      if (createdAtStart != "" && createdAtEnd != "") {
        var startDate = new Date(createdAtStart + 'T00:00:00');
        var endDate = new Date(createdAtEnd + 'T23:59:59');
        console.log(startDate);
        console.log(endDate);
        where['createdAt'] = {
          $gte: new Date(startDate),
          $lt: new Date(endDate) 
        };
      }
    }
    if (genre != undefined) {
      if (genre != "") {
        where['genre'] = new mongoose.Types.ObjectId(genre);
      }
    }
    if (theme != undefined) {
      if (theme != "") {
        where['theme'] = new mongoose.Types.ObjectId(theme);
      }
    }
    if (mood != undefined) {
      if (mood != "") {
        where['mood'] = new mongoose.Types.ObjectId(mood);
      }
    }
    if (status != undefined) {
      if (status != "") {
        where['isActive'] = status;
      }
    }
    where['isDelete'] = false;
    const query = await this.MediamusicModel.find(where).limit(perPage).skip(perPage * page).sort({ musicTitle: 'desc' });
    return query;
  }

  async getVideoApsaraSingle(ids: String) {
    //this.logger.log('getVideoApsaraSingle >>> start: ' + ids);
    var RPCClient = require('@alicloud/pop-core').RPCClient;

    let client = new RPCClient({
      accessKeyId: this.configService.get("APSARA_ACCESS_KEY"),
      accessKeySecret: this.configService.get("APSARA_ACCESS_SECRET"),
      endpoint: 'https://vod.ap-southeast-5.aliyuncs.com',
      apiVersion: '2017-03-21'
    });

    let params = {
      "RegionId": this.configService.get("APSARA_REGION_ID"),
      "VideoId": ids,
      "StreamType": "audio",
    }

    let requestOption = {
      method: 'POST'
    };

    let result = await client.request('GetPlayInfo', params, requestOption);
    let xres = new ApsaraPlayResponse();
    //this.logger.log('getVideoApsaraSingle >>> response: ' + JSON.stringify(result));
    if (result != null && result.PlayInfoList != null && result.PlayInfoList.PlayInfo && result.PlayInfoList.PlayInfo.length > 0) {
      xres.PlayUrl = result.PlayInfoList.PlayInfo[0].PlayURL;
    }
    return result;
  }

  async getImageApsara(ids: String[]): Promise<ApsaraImageResponse> {
    let san: String[] = [];
    for (let i = 0; i < ids.length; i++) {
      let obj = ids[i];
      if (obj != undefined && obj != 'undefined') {
        san.push(obj);
      }
    }

    let tx = new ApsaraImageResponse();
    let vl: ImageInfo[] = [];
    let chunk = this.chunkify(san, 15);
    for (let i = 0; i < chunk.length; i++) {
      let c = chunk[i];

      let vids = c.join(',');
      //this.logger.log("getImageApsara >>> video id: " + vids);
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
      let ty: ApsaraImageResponse = Object.assign(dto, JSON.parse(JSON.stringify(result)));

      if (ty.ImageInfo.length > 0) {
        for (let x = 0; x < ty.ImageInfo.length; x++) {
          let vv = ty.ImageInfo[x];
          vl.push(vv);
        }
      }
    }
    tx.ImageInfo = vl;
    return tx;
  }

  private chunkify(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.slice(i, i + chunkSize);
      res.push(chunk);
    }
    return res;
  }
}
