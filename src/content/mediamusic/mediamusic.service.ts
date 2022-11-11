import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MediamusicDto } from './dto/mediamusic.dto';
import { Mediamusic, MediamusicDocument } from './schemas/mediamusic.schema';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class MediamusicService {
  private readonly logger = new Logger(MediamusicService.name);
  constructor(
    @InjectModel(Mediamusic.name, 'SERVER_FULL')
    private readonly MediamusicModel: Model<MediamusicDocument>,
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
      if (theme != "") {
        where['mood'] = new mongoose.Types.ObjectId(theme);
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
      { active: false },
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
      // {
      //   $facet:
      //   {
      //     "artistPopuler": [
      //       { $skip: 0 },
      //       { $limit: 5 },
      //       { $sort: { time_added: 1 } }
      //     ],
      //     "filterCount": [{ $match: {} }, { $group: { _id: null, count: { $sum: 1 } } }],
      //     "totalCount": [{ $group: { _id: null, count: { $sum: 1 } } }]
      //   }
      // }
    ]);
    return query;
  }
}
